import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '../../stores/sidebarStore'
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  FolderOpen, 
  CheckSquare,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const mobileNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Users", href: "/users", icon: Users },
  { title: "Projects", href: "/projects", icon: FolderOpen },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
]

const MobileNavigation: React.FC = () => {
  const { isOpen, toggleSidebar } = useSidebarStore()
  const location = useLocation()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm lg:hidden"
        onClick={toggleSidebar}
      />

      {/* Slide-out menu */}
      <div className="fixed inset-y-0 left-0 z-30 w-64 bg-sidebar shadow-xl lg:hidden border-r border-sidebar-border">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">PM</span>
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground font-sans">
              Project Manager
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSidebar}
            className="hover:bg-sidebar-accent"
          >
            <X className="w-5 h-5 text-sidebar-foreground" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="px-2 py-4 space-y-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === location.pathname

            return (
              <Link
                key={item.title}
                to={item.href}
                onClick={toggleSidebar}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

export default MobileNavigation
