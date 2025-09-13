import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNavigation from './MobileNavigation'
import { useSidebarStore } from '../../stores/sidebarStore'
import { useAuthStore } from '../../features/auth/stores/authStore'

interface MainLayoutProps {
  children?: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { setMobile } = useSidebarStore()
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
    
    const handleResize = () => {
      setMobile(window.innerWidth < 1024)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [checkAuth, setMobile])

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
