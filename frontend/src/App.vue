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

let audioUnlockCleanup: CleanupFn | null = null
const musicEnabled = ref(false)
const categories = ref<Category[]>(defaultCategories.map((cat) => ({ ...cat, options: [...cat.options] })))

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


const allFilled = computed(() =>
  categories.value.every((cat) => cat.options.every((opt) => opt.trim().length > 0))
)

// Flip into the main experience; stop intro effects.
const start = async () => {
  started.value = true
}

// Spin the wheel: pick a number between 5 and 9 and log it.
const spinWheel = () => {
  if (!allFilled.value || hasSpun.value) return
  const step = Math.floor(Math.random() * 5) + 5 // 5..9 inclusive

  const working = [
    { key: 'mash', options: [...MASH_OPTIONS] },
    ...categories.value.map((cat) => ({
    key: cat.key,
    options: [...cat.options]
  }))
  ]

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

  while (canRemove() && safety < maxIterations) {
    const { ci, oi } = flat[idx]!
    const catRemaining = remainingCounts[ci] ?? 0
    if (!removed[ci]?.[oi] && catRemaining > 1) {
      counter += 1
      if (counter === step) {
        if (removed[ci]) {
          removed[ci][oi] = true
        }
        remainingCounts[ci] = Math.max(0, catRemaining - 1)
        counter = 0
      }
    }
    idx = (idx + 1) % flat.length
    safety += 1
  }

  const results = working.map((cat, ci) => {
    const remainingIdx = cat.options.findIndex((_, oi) => !removed[ci]?.[oi])
    return { category: cat.key, choice: cat.options[remainingIdx] ?? '' }
  })

  console.log(`Spin result (step=${step}):`, results)
  hasSpun.value = true
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
})
</script>

<template>
  <WallpaperLayer />
  <main class="page">
    <button
      class="music-toggle"
      type="button"
      :aria-pressed="musicEnabled"
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
            :class="{ 'chip--active': idx === activeLetterIndex }"
            :data-testid="`chip-${letter}`"
          >
            {{ letter }}
          </span>
        </div>
      </header>
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
                :data-testid="`chip-inline-${letter}`"
              >
                {{ letter }}
              </span>
            </div>
          </div>
        </Transition>
        <p class="form-lead">{{ LABEL_FORM_LEAD }}</p>
        <div class="form-actions">
          <button class="ghost-button" type="button" @click="clearOptions">
            {{ LABEL_CLEAR }}
          </button>
          <button
            class="ghost-button ghost-button--primary"
            type="button"
            :disabled="!allFilled || hasSpun"
            @click="spinWheel"
          >
            {{ LABEL_SPIN_PLACEHOLDER }}
          </button>
        </div>
        <form class="prompt-grid">
          <div v-for="cat in categories" :key="cat.key" class="prompt">
            <label class="prompt__label" :for="`${cat.key}-0`">
              <span class="prompt__icon" aria-hidden="true">{{ categoryIcons[cat.key] ?? '✏️' }}</span>
              {{ cat.label }}
            </label>
            <ul class="prompt__options" role="list">
              <li v-for="(option, idx) in cat.options" :key="idx" class="prompt__row">
                <span class="prompt__dot" aria-hidden="true">•</span>
                <input
                  :id="`${cat.key}-${idx}`"
                  v-model="cat.options[idx]"
                  type="text"
                  maxlength="50"
                  class="prompt__input prompt__input--underline"
                />
              </li>
            </ul>
          </div>
        </form>
      </section>
    </Transition>
  </main>
</template>
