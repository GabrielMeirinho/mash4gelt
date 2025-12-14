// All the fixed bits of the MASH UI live here so the main view stays tidy.

// Order of the marquee letters that animate on the intro screen.
export const LETTERS = ['M', 'A', 'S', 'H'] as const

// Interval (ms) between each letter lighting up.
export const LETTER_INTERVAL_MS = 500

// Emoji-esque icons for each category in the form.
export const categoryIcons: Record<string, string> = {
  mash: '??',
  partner: '❤️',
  career: '📂',
  city: '🏙️',
  salary: '💰',
  children: '👶',
  vehicle: '🚗'
}

// Default options shown on first load.
export const defaultCategories = [
  { key: 'partner', label: 'Partner', options: ['Jannet', 'Michael', 'Steve', 'Jeff (Hi, I am Jeff!)'] },
  { key: 'career', label: 'Career', options: ['Scientist', 'Rock Star', 'Doctor', 'Poop Cleaner'] },
  { key: 'city', label: 'City', options: ['Paris', 'London', 'New York', 'Duddley'] },
  { key: 'salary', label: 'Salary/year', options: ['£100.000', '£50.000', '£10.000', '£0.1'] },
  { key: 'children', label: 'Children', options: ['3', '2', '1', '15'] },
  { key: 'vehicle', label: 'Vehicle', options: ['Volvo', 'Tesla', 'Ferrari', 'Bike'] }
] as const

// Entry music track (bundled wav) that loops during the intro.
export const ENTRY_SOUND_URL = new URL('./sounds/beep_box_entry.wav', import.meta.url)
// Drum roll clip for the spin suspense.
export const DRUM_ROLL_URL = new URL('./sounds/drum_roll_trimmed.mp3', import.meta.url)
// Cheer clip to celebrate the step reveal.
export const CHEER_URL = new URL('./sounds/short_crowd_cheer.mp3', import.meta.url)
// 8-bit loop that plays during the elimination round.
export const LOOP_MUSIC_URL = new URL('./sounds/8bit_music.mp3', import.meta.url)

// UI copy
export const LABEL_MUSIC_ON = '🔊 Music on'
export const LABEL_MUSIC_OFF = '🔇 Music off'
export const LABEL_START = 'Start'
export const LABEL_FORM_LEAD = 'Choose your options before we spin the wheel of fate.'
export const LABEL_CLEAR = 'Clear'
export const LABEL_SPIN_PLACEHOLDER = 'Spin wheel of luck!'
export const LABEL_RESULTS_TITLE = 'Your MASH fate'
export const LABEL_RESULTS_ACTION = 'Start again'

// Static MASH housing options (not user-editable).
export const MASH_OPTIONS = ['Mansion', 'Apartment', 'Shack', 'House'] as const

// Wallpaper assets and grid layout for the crayon background.
export const WALLPAPER_ASSETS: string[] = [
  new URL('@/images/crayon_h.png', import.meta.url).href,
  new URL('@/images/crayon_m.png', import.meta.url).href,
  new URL('@/images/crayon_s.png', import.meta.url).href,
  new URL('@/images/crayon_d.png', import.meta.url).href,
  new URL('@/images/crayon_f.png', import.meta.url).href,
  new URL('@/images/crayon_sun.png', import.meta.url).href
]

// Some grid values to add the drawing minuatures.
export const WALLPAPER_GRID_ROWS = 9
export const WALLPAPER_GRID_COLS = 13
