import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '../../stores/sidebarStore'
import { usePermissions } from '@/hooks/usePermissions'
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
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import type { PermissionName } from '@/types/User'

interface MobileNavigationChild {
  title: string
  href: string
  permission?: PermissionName
  permissions?: PermissionName[]
  requireAll?: boolean
}

interface MobileNavigationItem {
  title: string
  href?: string
  icon: any
  permission?: PermissionName
  permissions?: PermissionName[]
  requireAll?: boolean
  children?: MobileNavigationChild[]
}

const mobileNavItems: MobileNavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    permission: "view analytics"
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    permission: "view users"
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderOpen,
    permission: "view projects"
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    permission: "view tasks"
  },
  {
    title: "Help Requests",
    icon: HelpCircle,
    href: "/help-requests",
    permission: "view help requests"
  },
  {
    title: "Tickets",
    icon: Ticket,
    href: "/tickets",
    permission: "view tickets"
  },
  {
    title: "Ratings",
    icon: Star,
    permissions: ["view rating configs", "create task ratings", "create stakeholder ratings", "view final ratings"],
    requireAll: false,
    children: [
      { 
        title: "Configurations", 
        href: "/rating-configs",
        permission: "view rating configs"
      },
      { 
        title: "Ratings", 
        href: "/ratings",
        permissions: ["create task ratings", "create stakeholder ratings", "view final ratings"],
        requireAll: false
      },
    ]
  },
  {
    title: "Roles",
    icon: Shield,
    href: "/roles",
    permission: "view roles"
  }
]

const MobileNavigation: React.FC = () => {
  const { isOpen, toggleSidebar } = useSidebarStore()
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  const hasAccessToItem = (item: MobileNavigationItem | MobileNavigationChild): boolean => {
    if (!item.permission && !item.permissions) {
      return true
    }

    if (item.permission && !hasPermission(item.permission)) {
      return false
    }

    if (item.permissions) {
      if (item.requireAll && !hasAllPermissions(item.permissions)) {
        return false
      } else if (!item.requireAll && !hasAnyPermission(item.permissions)) {
        return false
      }
    }

    return true
  }

  const getVisibleChildren = (children?: MobileNavigationChild[]): MobileNavigationChild[] => {
    if (!children) return []
    return children.filter(child => hasAccessToItem(child))
  }

  const shouldShowParent = (item: MobileNavigationItem): boolean => {
    if (!hasAccessToItem(item)) return false
    
    if (item.children) {
      const visibleChildren = getVisibleChildren(item.children)
      return visibleChildren.length > 0
    }
    
    return true
  }

  const visibleMobileNavItems = mobileNavItems.filter(shouldShowParent)

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
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.svg" 
              alt="Logo" 
              className="h-10 w-auto"
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
          {visibleMobileNavItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === location.pathname
            const isExpanded = expandedItems.includes(item.title)
            const visibleChildren = getVisibleChildren(item.children)
            const hasChildren = visibleChildren.length > 0

            return (
              <div key={item.title}>
                {item.href ? (
                  <Link
                    to={item.href}
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
                ) : (
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start px-3 py-3 text-base font-medium rounded-md transition-colors",
                      "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                    )}
                    onClick={() => toggleExpanded(item.title)}
                  >
                    <Icon className="w-6 h-6 mr-3" />
                    <span className="flex-1 text-left">{item.title}</span>
                    {hasChildren && (
                      isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )
                    )}
                  </Button>
                )}

                {/* Children */}
                {hasChildren && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-sidebar-border pl-2">
                    {visibleChildren.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        onClick={toggleSidebar}
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
    </>
  )
}

export default MobileNavigation
