import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TaskDialogProvider } from './components/TaskDialogProvider'
import { useThemeStore } from './stores/themeStore'
import { useAuthStore } from './features/auth/stores/authStore' // 👈 add

const App: React.FC = () => {
  const { theme, setTheme } = useThemeStore()
  const checkAuth = useAuthStore((s) => s.checkAuth) // 👈

  // Initialize theme on app load
  useEffect(() => {
    setTheme(theme)
    checkAuth() // 👈
  }, [])
  
  return (
    <>
    <div className="overflow-hidden">
      <TaskDialogProvider>
      <Outlet />
      <Toaster position="bottom-right" richColors closeButton />
      </TaskDialogProvider>
    </div>
    </>
  )
}

export default App
