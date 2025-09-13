import React from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'

const App: React.FC = () => {
  return (
    <>
      <Outlet />
      <Toaster position="bottom-right" richColors closeButton />
    </>
  )
}

export default App
