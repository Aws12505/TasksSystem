// hooks/useTheme.ts
import { useThemeStore } from '../stores/themeStore'

export const useTheme = () => {
  const { theme, setTheme, actualTheme } = useThemeStore()
  
  return {
    theme,
    setTheme,
    actualTheme,
  }
}
