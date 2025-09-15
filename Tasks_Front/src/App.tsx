import React from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TaskDialogProvider } from './components/TaskDialogProvider'

const App: React.FC = () => {
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
