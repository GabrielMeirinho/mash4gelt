<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import WallpaperLayer from './components/WallpaperLayer.vue'
import {
  ENTRY_SOUND_URL,
  LABEL_CLEAR,
  LABEL_FORM_LEAD,
  LABEL_MUSIC_OFF,
  LABEL_MUSIC_ON,
  LABEL_SPIN_PLACEHOLDER,
  LABEL_START,
  LABEL_RESULTS_ACTION,
  LABEL_RESULTS_TITLE,
  DRUM_ROLL_URL,
  CHEER_URL,
  LOOP_MUSIC_URL,
  LOOP_MUSIC_VOLUME,
  ELIMINATION_SOUNDS,
  MASH_KEY,
  MASH_LABEL,
  HERO_TAGLINE,
  MASH_OPTIONS,
  LETTERS,
  LETTER_INTERVAL_MS,
  categoryIcons,
  defaultCategories
} from './constants'
import {
  attachAudioUnlock,
  createLoopingAudio,
  playAudio,
  stopAudio,
  type CleanupFn
} from './utils/sound_utils'

type Category = {
  key: string
  label: string
  options: string[]
}

const started = ref(false)
const activeLetterIndex = ref(-1)
let letterIntervalId: number | null = null
const hasSpun = ref(false)
const isSpinning = ref(false)
const activeMashIterIndex = ref(-1)
const activeCategoryKey = ref<string | null>(null)
const activeOptionIndex = ref<number | null>(null)
const showResultsModal = ref(false)
const resultsData = ref<Array<{ category: string; choice: string }>>([])
const showStepOverlay = ref(false)
const stepOverlayValue = ref<number | null>(null)
const lastStep = ref<number | null>(null)
const flashRemoval = ref<{ key: string; idx: number } | null>(null)
let resultsModalTimeout: number | null = null
const drumRollAudio = new Audio(DRUM_ROLL_URL.href)
const cheerAudio = new Audio(CHEER_URL.href)
const loopMusicAudio = new Audio(LOOP_MUSIC_URL.href)
loopMusicAudio.loop = true
loopMusicAudio.volume = LOOP_MUSIC_VOLUME
const eliminationSoundPool = ELIMINATION_SOUNDS.map((u) => u.href)
const makeChosenMap = () => {
  const base: Record<string, number | null> = { mash: null }
  defaultCategories.forEach((cat) => {
    base[cat.key] = null
  })
  return base
}
const chosenIndices = ref<Record<string, number | null>>(makeChosenMap())
const eliminated = ref<Record<string, Set<number>>>(
  Object.fromEntries(defaultCategories.map((cat) => [cat.key, new Set<number>()]))
)

// Kick off the marquee animation loop for the intro letters.
const startLetterCycle = () => {
  stopLetterCycle()
  activeLetterIndex.value = 0
  letterIntervalId = window.setInterval(() => {
    activeLetterIndex.value = (activeLetterIndex.value + 1) % LETTERS.length
  }, LETTER_INTERVAL_MS)
}

// Halt the marquee loop and clear any active highlight.
const stopLetterCycle = () => {
  if (letterIntervalId !== null) {
    window.clearInterval(letterIntervalId)
    letterIntervalId = null
  }
  activeLetterIndex.value = -1
}

const entrySound = createLoopingAudio(ENTRY_SOUND_URL.href, 0.35)
const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

let audioUnlockCleanup: CleanupFn | null = null
const musicEnabled = ref(false)
const categories = ref<Category[]>(defaultCategories.map((cat) => ({ ...cat, options: [...cat.options] })))
const mashEliminated = ref<Set<number>>(new Set())

const getLabelForKey = (key: string) => {
  if (key === MASH_KEY) return MASH_LABEL
  return categories.value.find((cat) => cat.key === key)?.label ?? key
}

// Start the intro music; if autoplay is blocked the unlock handler will retry.
const startEntrySound = async () => {
  if (!musicEnabled.value) return
  const played = await playAudio(entrySound, musicEnabled.value)
  if (!played) {
    attachUnlock()
  }
}

const stopEntrySound = () => {
  stopAudio(entrySound)
}

// Attach first-gesture listeners to satisfy autoplay policies.
const attachUnlock = () => {
  if (audioUnlockCleanup) return
  audioUnlockCleanup = attachAudioUnlock(() => {
    if (!started.value) {
      void startEntrySound()
    }
  })
}

const detachAudioUnlock = () => {
  audioUnlockCleanup?.()
  audioUnlockCleanup = null
}

// Toggle music on/off from the UI control.
const toggleMusic = () => {
  musicEnabled.value = !musicEnabled.value
  if (musicEnabled.value) {
    void startEntrySound()
  } else {
    stopEntrySound()
  }
}

const playDrumRollClip = async (maxDurationMs = 4500) =>
  new Promise<void>((resolve) => {
    // ensure clean start
    drumRollAudio.pause()
    drumRollAudio.currentTime = 0
    drumRollAudio.volume = 0.8
    drumRollAudio.muted = false
    drumRollAudio.playbackRate = 1

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      drumRollAudio.onended = null
      drumRollAudio.onerror = null
      resolve()
    }
    const timer = window.setTimeout(finish, maxDurationMs)
    drumRollAudio.onended = () => {
      window.clearTimeout(timer)
      finish()
    }
    drumRollAudio.onerror = () => {
      window.clearTimeout(timer)
      finish()
    }
    void drumRollAudio.play().catch(() => {
      window.clearTimeout(timer)
      finish()
    })
  })

const revealStepOverlay = async (step: number) => {
  await playDrumRollClip()
  // play cheer while showing the number
  cheerAudio.pause()
  cheerAudio.currentTime = 0
  cheerAudio.volume = 0.85
  void cheerAudio.play().catch(() => {})
  stepOverlayValue.value = step
  showStepOverlay.value = true
  await sleep(3000)
  showStepOverlay.value = false
  cheerAudio.pause()
}

const startLoopMusic = async () => {
  loopMusicAudio.pause()
  loopMusicAudio.currentTime = 0
  loopMusicAudio.volume = LOOP_MUSIC_VOLUME
  loopMusicAudio.muted = false
  loopMusicAudio.playbackRate = 1
  try {
    await loopMusicAudio.play()
  } catch {
    console.log('auto play issues detected!')
  }
}

const stopLoopMusic = () => {
  loopMusicAudio.pause()
  loopMusicAudio.currentTime = 0
}

const playEliminationSound = () => {
  if (!eliminationSoundPool.length) return
  const idx = Math.floor(Math.random() * eliminationSoundPool.length)
  const audio = new Audio(eliminationSoundPool[idx] ?? eliminationSoundPool[0])
  audio.volume = 0.85
  void audio.play().catch(() => {})
}


const allFilled = computed(() =>
  categories.value.every((cat) => cat.options.every((opt) => opt.trim().length > 0))
)

// Flip into the main experience; stop intro effects.
const start = async () => {
  started.value = true
}

const isEliminated = (key: string, idx: number) => eliminated.value[key]?.has(idx) ?? false

// Spin the wheel: pick a number between 5 and 9 and log it.
const spinWheel = async () => {
  // Bail out if form not ready or a spin already ran/is running.
  if (!allFilled.value || hasSpun.value || isSpinning.value) return
  // Mark busy and give a short UX pause.
  isSpinning.value = true
  await sleep(1000)
  // Stop the intro music and hide its toggle during the spin.
  if (musicEnabled.value) {
    musicEnabled.value = false
    stopEntrySound()
  }
  // Reset transient UI state.
  activeMashIterIndex.value = -1
  activeCategoryKey.value = null
  activeOptionIndex.value = null
  chosenIndices.value = makeChosenMap()
  // reset elimination marks
  Object.values(eliminated.value).forEach((set) => set.clear())
  mashEliminated.value = new Set()
  showResultsModal.value = false
  resultsData.value = []
  if (resultsModalTimeout !== null) {
    window.clearTimeout(resultsModalTimeout)
    resultsModalTimeout = null
  }

  // Choose a step (5..9) avoiding the immediately previous one.
  const pickStep = () => {
    const pool = [5, 6, 7, 8, 9].filter((n) => n !== lastStep.value)
    if (!pool.length) {
      return Math.floor(Math.random() * 5) + 5
    }
    const idx = Math.floor(Math.random() * pool.length)
    return pool[idx]!
  }

  const step = pickStep()
  lastStep.value = step
  // Play drum roll + cheer overlay, then start loop music with a 2s lead-in.
  await revealStepOverlay(step)
  await startLoopMusic()
  await sleep(2000)

  const working = [
    { key: MASH_KEY, options: [...MASH_OPTIONS] },
    ...categories.value.map((cat) => ({
    key: cat.key,
    options: [...cat.options]
  }))
  ]

  // Track removals and a flattened list to iterate over.
  const removed: boolean[][] = working.map((cat) => cat.options.map(() => false))
  const remainingCounts = working.map((cat) => cat.options.length)
  const flat: Array<{ ci: number; oi: number }> = working.flatMap((cat, ci) =>
    cat.options.map((_, oi) => ({ ci, oi }))
  )
  if (!flat.length) return

  const canRemove = () => remainingCounts.some((count) => count > 1)
  let idx = 0
  let counter = 0
  let safety = 0
  const maxIterations = flat.length * 1000
  const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

  while (canRemove() && safety < maxIterations) {
    // Skip already removed slots or categories that are down to 1 item.
    let hops = 0
    let current = flat[idx]
    while (
      current &&
      hops < flat.length &&
      (removed[current.ci]?.[current.oi] || (remainingCounts[current.ci] ?? 0) <= 1)
    ) {
      idx = (idx + 1) % flat.length
      current = flat[idx]
      hops += 1
    }
    if (hops >= flat.length || !current) break

    // Update UI highlights for current category/option.
    const { ci, oi } = current
    activeMashIterIndex.value = ci === 0 ? oi : -1
    activeCategoryKey.value = working[ci]?.key ?? null
    activeOptionIndex.value = working[ci]?.key === MASH_KEY ? null : oi

    // Small delay between hops (tweakable for debugging speed).
    await wait(600)

    // Only remove if category still has more than one item.
    const catRemaining = remainingCounts[ci] ?? 0
    if (!removed[ci]?.[oi] && catRemaining > 1) {
      counter += 1
      if (counter === step) {
        if (removed[ci]) {
          removed[ci][oi] = true
          const catKey = working[ci]?.key
          if (catKey && eliminated.value[catKey]) {
            eliminated.value[catKey].add(oi)
          } else if (catKey === MASH_KEY) {
            mashEliminated.value = new Set([...mashEliminated.value, oi])
          }
          if (catKey) {
            // Play a stinger, flash the item, pause briefly.
            playEliminationSound()
            flashRemoval.value = { key: catKey, idx: oi }
            await wait(2000)
            flashRemoval.value = null
          }
        }
        remainingCounts[ci] = Math.max(0, catRemaining - 1)
        counter = 0
      }
    }
    idx = (idx + 1) % flat.length
    safety += 1
  }

  // Record the survivor in each category and surface it in the results modal.
  const results = working.map((cat, ci) => {
    const remainingIdx = cat.options.findIndex((_, oi) => !removed[ci]?.[oi])
    chosenIndices.value[cat.key] = remainingIdx >= 0 ? remainingIdx : null
    return { category: cat.key, choice: cat.options[remainingIdx] ?? '' }
  })
  resultsData.value = results

  console.log(`Spin result (step=${step}):`, results)
  hasSpun.value = true
  activeMashIterIndex.value = -1
  activeCategoryKey.value = null
  activeOptionIndex.value = null
  isSpinning.value = false
  stopLoopMusic()
  // Show results after a brief delay with a cheer.
  resultsModalTimeout = window.setTimeout(() => {
    cheerAudio.pause()
    cheerAudio.currentTime = 0
    cheerAudio.volume = 0.85
    void cheerAudio.play().catch(() => {})
    showResultsModal.value = true
    resultsModalTimeout = null
  }, 2000)
}

// Reset all user-entered options back to blanks.
const clearOptions = () => {
  categories.value = categories.value.map((cat) => ({
    ...cat,
    options: cat.options.map(() => '')
  }))
}

// Keep intro visuals/sound running until Start, then stop them.
watch(
  () => started.value,
  (isStarted) => {
    if (isStarted) {
      stopLetterCycle()
      detachAudioUnlock()
    } else {
      startLetterCycle()
      void startEntrySound()
      attachUnlock()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  stopLetterCycle()
  stopEntrySound()
  detachAudioUnlock()
  drumRollAudio.pause()
  cheerAudio.pause()
  stopLoopMusic()
})

// restaring every value we need to have the game fresh again
const restartGame = () => {
  hasSpun.value = false
  isSpinning.value = false
  activeMashIterIndex.value = -1
  activeCategoryKey.value = null
  activeOptionIndex.value = null
  chosenIndices.value = makeChosenMap()
  Object.values(eliminated.value).forEach((set) => set.clear())
  mashEliminated.value = new Set()
  resultsData.value = []
  showResultsModal.value = false
  showStepOverlay.value = false
  stepOverlayValue.value = null
  drumRollAudio.pause()
  drumRollAudio.currentTime = 0
  cheerAudio.pause()
  cheerAudio.currentTime = 0
  stopLoopMusic()
  if (resultsModalTimeout !== null) {
    window.clearTimeout(resultsModalTimeout)
    resultsModalTimeout = null
  }
}
</script>

<template>
  <WallpaperLayer />
  <main class="page">
    <button
      v-if="!isSpinning"
      class="music-toggle"
      type="button"
      :aria-pressed="musicEnabled"
      :title="musicEnabled ? 'I discovered how much I hate this sound after 30 secs' : 'Mate, leave this off—you will not like it'"
      @click="toggleMusic"
    >
      {{ musicEnabled ? LABEL_MUSIC_ON : LABEL_MUSIC_OFF }}
    </button>

    <Transition name="title-fade">
      <header v-if="!started" class="hero">
        <div class="title">
          <span
            v-for="(letter, idx) in LETTERS"
            :key="letter"
                class="chip"
                :class="{
                  'chip--active': idx === activeLetterIndex,
                  'chip--chosen': chosenIndices.mash === idx,
                  'chip--eliminated': mashEliminated.has(idx) && chosenIndices.mash !== idx,
                  'chip--flash': flashRemoval?.key === 'mash' && flashRemoval?.idx === idx
                }"
                :data-testid="`chip-${letter}`"
              >
            {{ letter }}
          </span>
        </div>
      </header>
    </Transition>

    <Transition name="fade">
      <p v-if="!started" class="hero-tagline" aria-live="polite">
        {{ HERO_TAGLINE }}
      </p>
    </Transition>

    <Transition name="fade">
      <button
        v-if="!started"
        class="start"
        type="button"
        @pointerdown.prevent="startEntrySound"
        @click="start"
      >
        {{ LABEL_START }}
      </button>
    </Transition>

    <Transition name="grow">
      <section v-if="started" class="form-card">
        <Transition name="title-slide">
          <div v-if="started" class="form-title" aria-hidden="true">
            <div class="title">
              <span
                v-for="letter in LETTERS"
                :key="letter"
                class="chip chip--inline"
                :class="{
                  'chip--active': activeCategoryKey === 'mash' && activeMashIterIndex === LETTERS.indexOf(letter),
                  'chip--eliminated': mashEliminated.has(LETTERS.indexOf(letter)) && chosenIndices.mash !== LETTERS.indexOf(letter),
                  'chip--chosen': chosenIndices.mash === LETTERS.indexOf(letter),
                  'chip--flash': flashRemoval?.key === 'mash' && flashRemoval?.idx === LETTERS.indexOf(letter)
                }"
                :data-testid="`chip-inline-${letter}`"
              >
                {{ letter }}
              </span>
            </div>
          </div>
        </Transition>
        <p v-if="!hasSpun && !isSpinning" class="form-lead">{{ LABEL_FORM_LEAD }}</p>
        <div class="form-actions">
          <button
            v-if="!hasSpun && !isSpinning"
            class="ghost-button"
            type="button"
            @click="clearOptions"
          >
            {{ LABEL_CLEAR }}
          </button>
          <button
            class="ghost-button ghost-button--primary"
            type="button"
            v-if="!hasSpun && !isSpinning"
            :disabled="!allFilled || hasSpun"
            @click="spinWheel"
          >
            {{ LABEL_SPIN_PLACEHOLDER }}
          </button>
        </div>
        <form class="prompt-grid">
          <div
            v-for="cat in categories"
            :key="cat.key"
            class="prompt"
          >
            <label class="prompt__label" :for="`${cat.key}-0`">
              <span class="prompt__icon" aria-hidden="true">{{ categoryIcons[cat.key] ?? '✏️' }}</span>
              {{ cat.label }}
            </label>
            <ul class="prompt__options" role="list">
              <li
                v-for="(option, idx) in cat.options"
                :key="idx"
                class="prompt__row"
                :class="{
                  'prompt__row--eliminated': isEliminated(cat.key, idx),
                  'prompt__row--active': activeCategoryKey === cat.key && activeOptionIndex === idx,
                  'prompt__row--chosen': chosenIndices[cat.key] === idx,
                  'prompt__row--flash': flashRemoval?.key === cat.key && flashRemoval?.idx === idx
                }"
              >
                <span class="prompt__dot" aria-hidden="true">•</span>
                <input
                  :id="`${cat.key}-${idx}`"
                  v-model="cat.options[idx]"
                  type="text"
                  maxlength="50"
                  class="prompt__input prompt__input--underline"
                  :class="{ 'prompt__input--chosen': chosenIndices[cat.key] === idx }"
                />
              </li>
            </ul>
          </div>
        </form>
      </section>
    </Transition>

    <Transition name="fade">
      <div v-if="showStepOverlay && stepOverlayValue !== null" class="step-overlay" aria-live="polite">
        <div class="step-overlay__bubble">
          {{ stepOverlayValue }}
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showResultsModal" class="results-overlay" role="dialog" aria-modal="true">
        <div class="results-card">
          <div class="results-celebrate" aria-hidden="true">🎈🎉{{ LABEL_RESULTS_TITLE }}🎉🎊</div>
          <ul class="results-list" role="list">
            <li v-for="result in resultsData" :key="result.category" class="results-item">
              <span class="results-label">{{ getLabelForKey(result.category) }}</span>
              <span class="results-choice">{{ result.choice || '—' }}</span>
            </li>
          </ul>
          <button class="ghost-button ghost-button--primary results-action" type="button" @click="restartGame">
            {{ LABEL_RESULTS_ACTION }}
          </button>
        </div>
      </div>
    </Transition>
  </main>
</template>
