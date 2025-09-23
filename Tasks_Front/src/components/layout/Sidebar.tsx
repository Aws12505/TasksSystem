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
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import type { PermissionName } from '@/types/User'

interface NavigationChild {
  title: string
  href: string
  permission?: PermissionName
  permissions?: PermissionName[]
  requireAll?: boolean
}

interface NavigationItem {
  title: string
  href?: string
  icon: any
  permission?: PermissionName
  permissions?: PermissionName[]
  requireAll?: boolean
  children?: NavigationChild[]
}

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
    // No permission required for dashboard
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
    requireAll: false, // Show if user has ANY of these permissions
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

const Sidebar: React.FC = () => {
  const { isOpen } = useSidebarStore()
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

  const hasAccessToItem = (item: NavigationItem | NavigationChild): boolean => {
    // If no permissions specified, allow access
    if (!item.permission && !item.permissions) {
      return true
    }

    // Check single permission
    if (item.permission && !hasPermission(item.permission)) {
      return false
    }

    // Check multiple permissions
    if (item.permissions) {
      if (item.requireAll && !hasAllPermissions(item.permissions)) {
        return false
      } else if (!item.requireAll && !hasAnyPermission(item.permissions)) {
        return false
      }
    }

    return true
  }

  const getVisibleChildren = (children?: NavigationChild[]): NavigationChild[] => {
    if (!children) return []
    return children.filter(child => hasAccessToItem(child))
  }

  const shouldShowParent = (item: NavigationItem): boolean => {
    if (!hasAccessToItem(item)) return false
    
    // If it has children, check if any children are visible
    if (item.children) {
      const visibleChildren = getVisibleChildren(item.children)
      return visibleChildren.length > 0
    }
    
    return true
  }

  // Filter navigation items based on permissions
  const visibleNavigationItems = navigationItems.filter(shouldShowParent)

  return (
    <div className={cn(
      "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 h-full",
      isOpen ? "w-64" : "w-20"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-center px-4 py-4 border-b border-sidebar-border min-h-[64px]">
        {isOpen ? (
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
        ) : (
          <img 
            src="/logo.svg" 
            alt="Logo" 
            className="h-10 w-auto"
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {visibleNavigationItems.map((item) => {
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
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {isOpen && <span className="truncate">{item.title}</span>}
                  {!isOpen && (
                    <div className="absolute left-16 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      {item.title}
                    </div>
                  )}
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-3 py-2 text-sm font-medium rounded-md transition-colors group",
                    "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                  )}
                  onClick={() => toggleExpanded(item.title)}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {isOpen && (
                    <>
                      <span className="flex-1 text-left truncate">{item.title}</span>
                      {hasChildren && (
                        isExpanded ? (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )
                      )}
                    </>
                  )}
                  {!isOpen && (
                    <div className="absolute left-16 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      {item.title}
                    </div>
                  )}
                </Button>
              )}

              {/* Children */}
              {hasChildren && isExpanded && isOpen && (
                <div className="ml-6 mt-1 space-y-1 border-l border-sidebar-border pl-2">
                  {visibleChildren.map((child) => (
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
