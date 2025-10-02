// pages/UsersPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useUsers } from '../hooks/useUsers'
import { useFiltersStore } from '../../../stores/filtersStore'
import { usePermissions } from '@/hooks/usePermissions'
import UsersList from '../components/UsersList'
import { Plus, Search, Users } from 'lucide-react'

const UsersPage: React.FC = () => {
  const { 
    users, 
    pagination,
    isLoading, 
    deleteUser,
    goToPage,
    nextPage,
    prevPage
  } = useUsers()
  const { searchQuery, setSearchQuery } = useFiltersStore()
  const { hasPermission } = usePermissions()

  // Track which user is pending deletion (opens the dialog when not null)
  const [userToDelete, setUserToDelete] = React.useState<number | null>(null)

  // Confirm deletion (runs after user presses the dialog's Delete)
  const confirmDelete = async () => {
    if (!hasPermission('delete users')) {
      setUserToDelete(null)
      return
    }
    if (userToDelete) {
      await deleteUser(userToDelete)
      setUserToDelete(null)
    }
  }

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!pagination) return []
    const items: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
    const { current_page, last_page } = pagination
    
    if (current_page > 3) {
      items.push(1)
      if (current_page > 4) items.push('ellipsis-start')
    }

    for (let i = Math.max(1, current_page - 2); i <= Math.min(last_page, current_page + 2); i++) {
      items.push(i)
    }

    if (current_page < last_page - 2) {
      if (current_page < last_page - 3) items.push('ellipsis-end')
      items.push(last_page)
    }

    return items
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header (matches TasksPage pattern) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Users</h1>
              <p className="text-muted-foreground">Manage system users and their permissions</p>
            </div>
          </div>
          {hasPermission('create users') && (
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/users/create">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Link>
            </Button>
          )}
        </div>

        {/* Filters (align spacing & grid with TasksPage) */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users (name, email, role)…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-input text-foreground"
                />
              </div>

              {/* Reserved slots for future filters to retain layout parity */}
              <div className="hidden lg:block" />
              <div className="hidden lg:block" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards (use same grid system) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="w-4 h-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {pagination?.total || users.length || 0}
              </div>
            </CardContent>
          </Card>

          {/* Empty cards kept for visual balance if desired; remove if not needed */}
          <div className="hidden sm:block">
            <Card className="bg-card border-border h-full opacity-0 pointer-events-none" />
          </div>
          <div className="hidden lg:block">
            <Card className="bg-card border-border h-full opacity-0 pointer-events-none" />
          </div>
          <div className="hidden lg:block">
            <Card className="bg-card border-border h-full opacity-0 pointer-events-none" />
          </div>
        </div>

        {/* List Container with Fixed Height and Scroll (parity with TasksPage) */}
        <Card className="bg-card border-border flex-1 flex flex-col min-h-0">
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-hidden">
              <UsersList 
                users={users} 
                isLoading={isLoading} 
                // Open the dialog instead of deleting immediately
                onDelete={async (id) => setUserToDelete(id)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pagination (responsive layout like TasksPage) */}
        {pagination && pagination.last_page > 1 && (
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                  Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} results
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={prevPage}
                        className={pagination.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {generatePaginationItems().map((item, index) => (
                      <PaginationItem key={index}>
                        {item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => goToPage(item as number)}
                            isActive={pagination.current_page === item}
                            className="cursor-pointer"
                          >
                            {item}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={nextPage}
                        className={pagination.current_page === pagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Centered Alert Dialog (shadcn is centered by default across the whole viewport) */}
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent /* optional: control width */ className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default UsersPage
