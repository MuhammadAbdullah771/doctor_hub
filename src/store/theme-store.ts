import { useEffect } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'doctor-hub-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useThemeStore() {
  useEffect(() => {
    const theme = getInitialTheme()
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [])

  const setTheme = (theme: Theme) => {
    localStorage.setItem(STORAGE_KEY, theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'light' : 'dark')
  }

  return { toggleTheme, setTheme }
}
