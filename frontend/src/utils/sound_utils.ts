// Shared helpers to manage a looping audio clip with polite autoplay handling.

export type CleanupFn = () => void

// Create a simple audio element for a bundled asset.
export const createLoopingAudio = (src: string, volume = 0.35) => {
  const audio = new Audio(src)
  audio.volume = volume
  audio.loop = true
  audio.playbackRate = 0.8
  return audio
}

// Try to start playback if enabled; returns true when playing, false otherwise.
export const playAudio = async (audio: HTMLAudioElement, enabled: boolean) => {
  if (!enabled) return false
  try {
    if (audio.paused) {
      audio.currentTime = 0
    }
    await audio.play()
    return true
  } catch {
    return false
  }
}

// Stop playback and reset position.
export const stopAudio = (audio: HTMLAudioElement) => {
  audio.pause()
  audio.currentTime = 0
}

// Install a first-gesture handler to satisfy autoplay restrictions.
export const attachAudioUnlock = (startFn: () => void): CleanupFn | null => {
  if (typeof window === 'undefined') return null
  const handler = () => {
    void startFn()
  }
  window.addEventListener('pointerdown', handler)
  window.addEventListener('touchstart', handler)
  window.addEventListener('keydown', handler)
  return () => {
    window.removeEventListener('pointerdown', handler)
    window.removeEventListener('touchstart', handler)
    window.removeEventListener('keydown', handler)
  }
}
