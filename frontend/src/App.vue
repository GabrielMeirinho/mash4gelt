<script setup lang="ts">
import { ref } from 'vue'
import WallpaperLayer from './components/WallpaperLayer.vue'

type Category = {
  key: string
  label: string
  options: string[]
}

const started = ref(false)

const categoryIcons: Record<string, string> = {
  partner: '❤️',
  career: '📂',
  city: '🏙️',
  salary: '💰',
  children: '👶',
  car: '🚗'
}

const categories = ref<Category[]>([
  { key: 'partner', label: 'Partner', options: ['Jannet', 'Michael', 'Steve', 'Jeff ( Hi, I am Jeff!)'] },
  { key: 'career', label: 'Career', options: ['Scientist', 'Rock Star', 'Doctor', 'Poop Clearner'] },
  { key: 'city', label: 'City', options: ['Paris', 'London', 'New York', 'Duddley'] },
  { key: 'salary', label: 'Salary', options: ['50000', '25000', '1000', '0.1'] },
  { key: 'children', label: 'Children', options: ['3', '2', '1', '15'] },
  { key: 'car', label: 'Car', options: ['Volvo', 'Tesla', 'Ferrari', 'Bike'] }
])

const start = () => {
  started.value = true
}

const clearOptions = () => {
  categories.value = categories.value.map((cat) => ({
    ...cat,
    options: cat.options.map(() => '')
  }))
}
</script>

<template>
  <WallpaperLayer />
  <main class="page">
    <header class="hero">
      <div class="title">
        <span class="chip" data-testid="chip-M">M</span>
        <span class="chip" data-testid="chip-A">A</span>
        <span class="chip" data-testid="chip-S">S</span>
        <span class="chip" data-testid="chip-H">H</span>
      </div>
    </header>

    <Transition name="fade">
      <button v-if="!started" class="start" type="button" @click="start">Start</button>
    </Transition>

    <Transition name="grow">
      <section v-if="started" class="form-card">
        <p class="form-lead">Choose your options before we spin the wheel of fate.</p>
        <div class="form-actions">
          <button class="ghost-button" type="button" @click="clearOptions">Clear</button>
        </div>
        <form class="prompt-grid">
          <div v-for="cat in categories" :key="cat.key" class="prompt">
            <label class="prompt__label" :for="cat.key">
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
