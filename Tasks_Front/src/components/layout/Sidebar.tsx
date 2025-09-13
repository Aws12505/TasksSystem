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
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navigationItems = [
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

const Sidebar: React.FC = () => {
  const { isOpen, isMobile } = useSidebarStore()
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Analytics', 'Help Requests', 'Tickets', 'Ratings', 'System'])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  if (isMobile) return null

  return (
    <div className={cn(
      "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Logo */}
      <div className="flex items-center px-4 py-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-sm">PM</span>
          </div>
          {isOpen && (
            <span className="text-lg font-semibold text-sidebar-foreground font-sans">
              Project Manager
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === location.pathname
          const isExpanded = expandedItems.includes(item.title)
          const hasChildren = item.children && item.children.length > 0

          return (
            <div key={item.title}>
              {item.href ? (
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {isOpen && <span>{item.title}</span>}
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                  )}
                  onClick={() => toggleExpanded(item.title)}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {isOpen && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {hasChildren && (
                        isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )
                      )}
                    </>
                  )}
                </Button>
              )}

              {/* Children */}
              {hasChildren && isExpanded && isOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      className={cn(
                        "block px-3 py-2 text-sm rounded-md transition-colors",
                        location.pathname === child.href
                          ? "bg-sidebar-accent/30 text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
                      )}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar
