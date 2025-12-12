<script setup lang="ts">
// create this object to have a randomizer location for each stamp ( own rotation and localization )
type Stamp = {
  id: number
  src: string
  size: number
  top: number
  left: number
  rotate: number
  opacity: number
}

// getting the images to randomly put them at the page
const assets: string[] = [
  new URL('@/images/crayon_h.png', import.meta.url).href,
  new URL('@/images/crayon_m.png', import.meta.url).href,
  new URL('@/images/crayon_s.png', import.meta.url).href,
  new URL('@/images/crayon_d.png', import.meta.url).href,
  new URL('@/images/crayon_f.png', import.meta.url).href,
  new URL('@/images/crayon_sun.png', import.meta.url).href
]

const GRID_ROWS = 9
const GRID_COLS = 8

// Distribute stamps across a grid with small jitter to reduce overlap
const stamps: Stamp[] = Array.from({ length: GRID_ROWS * GRID_COLS }, (_, idx) => {
  //get the asses and randomize their input
  const assetIndex = Math.floor(Math.random() * assets.length) % assets.length
  const src = assets[assetIndex] ?? assets[0]!
  const row = Math.floor(idx / GRID_COLS)
  const col = idx % GRID_COLS

  // adjusting some space for this background ( I want to have these images at the back seprated.)
  const cellHeight = 120 / GRID_ROWS
  const cellWidth = 110 / GRID_COLS

  const jitterY = (Math.random() - 0.5) * (cellHeight * 0.4)
  const jitterX = (Math.random() - 0.5) * (cellWidth * 0.4)

  const top = (row + 0.25) * cellHeight + jitterY
  const left = (col + 0.25) * cellWidth + jitterX

  // Randomize size with an upper cap to avoid overscaling on zoom
  const size = 60 + Math.random() * 20 // max ~100px

  // randomize some rotation
  const rotate = 50 + Math.random() * 150

  // 70% visible at ~12% opacity, 30% fully invisible to keep spacing airy
  const isVisible = Math.random() < 0.70
  const opacity = isVisible ? 0.12 : 0

  // One nice thing I did check is for each deploy there is a different combination of these ( My randomizer input lets the wallpaper to be dynamic )

  return { id: idx, src, size, top, left, rotate, opacity }
})
</script>

<template>
  <div class="wallpaper" aria-hidden="true">
    <img
      v-for="stamp in stamps"
      :key="stamp.id"
      class="stamp"
      :src="stamp.src"
      :style="{
        width: `${stamp.size}px`,
        top: `${stamp.top}%`,
        left: `${stamp.left}%`,
        transform: `translate(-50%, -50%) rotate(${stamp.rotate}deg)`,
        opacity: stamp.opacity,
      }"
      loading="lazy"
      alt=""
    />
  </div>
</template>

<style scoped>
.wallpaper {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.stamp {
  position: absolute;
  filter: saturate(0.9);
}
</style>
