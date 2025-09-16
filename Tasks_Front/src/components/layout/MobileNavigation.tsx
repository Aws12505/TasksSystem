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
  HelpCircle, 
  Ticket, 
  Star, 
  Shield,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const mobileNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics"
  },
  {
    title: "Users",
    href: "/users",
    icon: Users
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderOpen
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare
  },
  {
    title: "Help Requests",
    icon: HelpCircle,
    href: "/help-requests"
  },
  {
    title: "Tickets",
    icon: Ticket,
    href: "/tickets"
  },
  {
    title: "Ratings",
    icon: Star,
    children: [
      { title: "Configurations", href: "/rating-configs" },
      { title: "Ratings", href: "/ratings" },
    ]
  },
  {
    title: "Roles",
    icon: Shield,
    href: "/roles"
  }
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
      <div className="fixed inset-y-0 left-0 z-30 w-64 bg-sidebar shadow-xl lg:hidden border-r border-sidebar-border transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">  {/* Increased space-x */}
            <img 
              src="/logo.svg" 
              alt="Logo" 
              className="h-10 w-auto"  // Increased from h-8 to h-10
            />
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
        <nav className="px-2 py-4 space-y-1 overflow-y-auto h-full pb-20">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === location.pathname

            return (
              <Link
                key={item.title}
                to={item.href || ''}
                onClick={toggleSidebar}
                className={cn(
                  "flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Icon className="w-6 h-6 mr-3" />
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