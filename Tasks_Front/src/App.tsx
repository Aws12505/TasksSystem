import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TaskDialogProvider } from './components/TaskDialogProvider'
import { useThemeStore } from './stores/themeStore'

const App: React.FC = () => {
  const { theme, setTheme } = useThemeStore()

  // Initialize theme on app load
  useEffect(() => {
    setTheme(theme)
  }, [])
  
  return (
    <>
      <TaskDialogProvider>
      <Outlet />
      <Toaster position="bottom-right" richColors closeButton />
      </TaskDialogProvider>
    </>
  )
}

export default App
