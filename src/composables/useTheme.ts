import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'

function systemPreference(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return systemPreference()
}

// Module-level singleton so every component shares the same state
const theme = ref<Theme>(getInitialTheme())

// Apply immediately on module load — before any component mounts
document.documentElement.setAttribute('data-theme', theme.value)

watch(theme, (t) => {
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('theme', t)
})

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggle }
}
