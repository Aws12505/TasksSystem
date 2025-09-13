import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useSidebarStore } from '../../stores/sidebarStore'
import { useAuthStore } from '../../features/auth/stores/authStore'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { Menu, Search, Bell, User } from 'lucide-react'

const Header: React.FC = () => {
  const { toggleSidebar } = useSidebarStore()
  const { user } = useAuthStore()
  const { logout } = useAuth()

  return (
    <header className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2 hover:bg-accent"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search..."
              className="pl-10 w-64 bg-muted border-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="p-2 relative hover:bg-accent">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2 hover:bg-accent">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-foreground">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
              <DropdownMenuLabel className="text-popover-foreground">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                onClick={logout}
                className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Header
