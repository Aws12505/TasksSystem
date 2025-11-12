import React, { useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuthStore } from '../../features/auth/stores/authStore'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { useTheme } from '../../hooks/useTheme'
import { ThemeSwitcher } from '@/components/ui/kibo-ui/theme-switcher'
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  HelpCircle, 
  Ticket, 
  Star, 
  Shield,
  ChevronRight,
  Clock
} from 'lucide-react'
import type { PermissionName } from '@/types/User'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from "@/components/ui/scroll-area"

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
    permissions: ["view rating configs", "create task ratings", "create stakeholder ratings"],
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
        permissions: ["create task ratings", "create stakeholder ratings"],
        requireAll: false
      },
      {
        title : "Final Ratings", 
        href: "/final-ratings",
        permission: "calculate final ratings"
      },
      {
        title: "Weighted Ratings (SOS)",
        href: "/ratings/sos",
        permission: "calculate final ratings"
      }
    ]
  },
  {
    title: "Clocking",
    icon: Clock,
    children: [
      {
        title: "Clocking IN/OUT",
        href: "/clocking",
      },
      {
        title: "Clocking Records",
        href: "/clocking/records",
      },
      {
        title: "Clocking Sessions",
        href: "/clocking/manager",
        permission: "view all clocking sessions"
      }
    ]
  },
  {
    title: "Roles",
    icon: Shield,
    href: "/roles",
    permission: "view roles"
  }
]
const getInitials = (name?: string) =>
  (name || 'User')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

// App Sidebar Component
function AppSidebar() {
  const location = useLocation()
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  const hasAccessToItem = (item: NavigationItem | NavigationChild): boolean => {
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

  const getVisibleChildren = (children?: NavigationChild[]): NavigationChild[] => {
    if (!children) return []
    return children.filter(child => hasAccessToItem(child))
  }

  const shouldShowParent = (item: NavigationItem): boolean => {
    if (!hasAccessToItem(item)) return false
    
    if (item.children) {
      const visibleChildren = getVisibleChildren(item.children)
      return visibleChildren.length > 0
    }
    
    return true
  }

  const visibleNavigationItems = navigationItems.filter(shouldShowParent)

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <div className="flex items-center space-x-2">
          <img 
            src="/logo.svg" 
            alt="Logo" 
            className="h-8 w-auto flex-shrink-0"
          />
          <span className="truncate text-lg font-semibold">
            Project Manager
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavigationItems.map((item) => {
                const Icon = item.icon
                const visibleChildren = getVisibleChildren(item.children)
                const hasChildren = visibleChildren.length > 0

                if (item.href && !hasChildren) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === item.href}
                      >
                        <Link to={item.href}>
                          <Icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                if (hasChildren) {
                  return (
                    <Collapsible key={item.title} asChild>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <Icon className="w-4 h-4" />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {visibleChildren.map((child) => (
                              <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton 
                                  asChild
                                  isActive={location.pathname === child.href}
                                >
                                  <Link to={child.href}>
                                    <span>{child.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return null
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <UserDropdown />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}

// User Dropdown Component
function UserDropdown() {
  const { user } = useAuthStore()
  const { logout } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg">
          <Avatar className="h-8 w-8">
  {typeof user?.avatar_url === 'string' && user.avatar_url.trim() !== '' && (
    <AvatarImage
      src={user.avatar_url}
      alt={user?.name ? `${user.name}'s avatar` : 'User avatar'}
      className="object-cover"
    />
  )}
  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
    {getInitials(user?.name)}
  </AvatarFallback>
</Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {user?.name || 'User'}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email || 'user@example.com'}
            </span>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" className="w-56">
        <DropdownMenuItem asChild>
           <Link to="/settings">My Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Header Component
function AppHeader() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      
      {/* Search
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search..."
          className="pl-10 bg-muted border-0"
        />
      </div> */}

      {/* Theme Switcher */}
      <div className="ml-auto">
        <ThemeSwitcher 
          defaultValue="system" 
          onChange={setTheme} 
          value={theme} 
        />
      </div>
    </header>
  )
}

interface MainLayoutProps {
  children?: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <SidebarProvider>
      {/* Viewport-bounded row containing the sidebar + content */}
      <div className="fixed inset-0 flex overflow-hidden">
        <AppSidebar />

        {/* Content column must be allowed to shrink: min-w-0 */}
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />

          <ScrollArea className="flex-1 min-h-0">
            {/* Hard content boundary + safe text/media defaults */}
            <div className="mx-auto w-full max-w-7xl px-4 md:px-6 break-words">
              <div className="[&>img]:max-w-full [&>img]:h-auto">
                {children || <Outlet />}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default MainLayout
