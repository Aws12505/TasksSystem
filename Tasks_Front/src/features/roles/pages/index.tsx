import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRoles } from '../hooks/useRoles'
import { useFiltersStore } from '../../../stores/filtersStore'
import RolesList from '../components/RolesList'
import { Plus, Search, Shield } from 'lucide-react'

const RolesPage: React.FC = () => {
  const { roles, isLoading, deleteRole } = useRoles()
  const { searchQuery, setSearchQuery } = useFiltersStore()

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      await deleteRole(id)
    }
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
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/roles/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Link>
        </Button>
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
            <div className="text-2xl font-bold text-foreground">{roles.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Roles List */}
      <RolesList 
        roles={roles} 
        isLoading={isLoading} 
        onDelete={handleDelete}
      />
    </div>
  )
}

export default RolesPage
