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
import { useRoles } from '../hooks/useRoles'
import { useFiltersStore } from '../../../stores/filtersStore'
import { usePermissions } from '@/hooks/usePermissions'
import RolesList from '../components/RolesList'
import { Plus, Search, Shield } from 'lucide-react'

const RolesPage: React.FC = () => {
  const { 
    roles, 
    pagination,
    isLoading, 
    deleteRole,
    goToPage,
    nextPage,
    prevPage
  } = useRoles()
  const { searchQuery, setSearchQuery } = useFiltersStore()
  const { hasPermission } = usePermissions()

  const handleDelete = async (id: number) => {
    if (!hasPermission('delete roles')) {
      return
    }
    
    if (window.confirm('Are you sure you want to delete this role?')) {
      await deleteRole(id)
    }
  }

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!pagination) return []

    const items = []
    const { current_page, last_page } = pagination
    
    if (current_page > 3) {
      items.push(1)
      if (current_page > 4) {
        items.push('ellipsis-start')
      }
    }

    for (let i = Math.max(1, current_page - 2); i <= Math.min(last_page, current_page + 2); i++) {
      items.push(i)
    }

    if (current_page < last_page - 2) {
      if (current_page < last_page - 3) {
        items.push('ellipsis-end')
      }
      items.push(last_page)
    }

    return items
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-sans">Roles</h1>
            <p className="text-muted-foreground">Manage system roles and their permissions</p>
          </div>
        </div>
        {hasPermission('create roles') && (
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/roles/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-input text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Roles
            </CardTitle>
            <Shield className="w-4 h-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {pagination?.total || roles.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles List */}
      <RolesList 
        roles={roles} 
        isLoading={isLoading} 
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} results
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
  )
}

export default RolesPage
