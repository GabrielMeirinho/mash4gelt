// All the fixed bits of the MASH UI live here so the main view stays tidy.

// Order of the marquee letters that animate on the intro screen.
export const LETTERS = ['M', 'A', 'S', 'H'] as const

// Interval (ms) between each letter lighting up.
export const LETTER_INTERVAL_MS = 500

// Emoji-esque icons for each category in the form.
export const categoryIcons: Record<string, string> = {
  partner: '❤️',
  career: '📂',
  city: '🏙️',
  salary: '💰',
  children: '👶',
  car: '🚗'
}

// Default options shown on first load.
export const defaultCategories = [
  { key: 'partner', label: 'Partner', options: ['Jannet', 'Michael', 'Steve', 'Jeff (Hi, I am Jeff!)'] },
  { key: 'career', label: 'Career', options: ['Scientist', 'Rock Star', 'Doctor', 'Poop Cleaner'] },
  { key: 'city', label: 'City', options: ['Paris', 'London', 'New York', 'Duddley'] },
  { key: 'salary', label: 'Salary', options: ['50000', '25000', '1000', '0.1'] },
  { key: 'children', label: 'Children', options: ['3', '2', '1', '15'] },
  { key: 'car', label: 'Car', options: ['Volvo', 'Tesla', 'Ferrari', 'Bike'] }
] as const

// Entry music track (bundled wav) that loops during the intro.
export const ENTRY_SOUND_URL = new URL('./sounds/beep_box_entry.wav', import.meta.url)

// UI copy
export const LABEL_MUSIC_ON = '🔊 Music on'
export const LABEL_MUSIC_OFF = '🔇 Music off'
export const LABEL_START = 'Start'
export const LABEL_FORM_LEAD = 'Choose your options before we spin the wheel of fate.'
export const LABEL_CLEAR = 'Clear'
export const LABEL_SPIN_PLACEHOLDER = 'Spin wheel (coming soon)'
