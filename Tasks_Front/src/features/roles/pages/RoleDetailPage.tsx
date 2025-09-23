import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRole } from '../hooks/useRole'
import { usePermissions } from '@/hooks/usePermissions'
import { Edit, ArrowLeft, Shield, Key, Calendar } from 'lucide-react'

const RoleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { role, isLoading, error } = useRole(id!)
  const { hasPermission } = usePermissions()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !role) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || 'Role not found'}</p>
      </div>
    )
  }

  // Safe access to permissions array
  const rolePermissions = role.permissions || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/roles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Roles
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-sans">{role.name}</h1>
              <p className="text-muted-foreground">Role Details</p>
            </div>
          </div>
        </div>
        {hasPermission('edit roles') && (
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to={`/roles/${role.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Role
            </Link>
          </Button>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Role Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium text-foreground">{role.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Guard Name</p>
              <p className="font-medium text-foreground">{role.guard_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(role.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(role.updated_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Permissions - Only show if user can view permissions */}
        {hasPermission('view permissions') ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Key className="w-4 h-4" />
                Permissions ({rolePermissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {rolePermissions.length > 0 ? (
                  rolePermissions.map((permission) => (
                    <div key={permission.id} className="p-2 bg-accent/50 rounded">
                      <span className="text-sm text-foreground">{permission.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No permissions assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Key className="w-4 h-4" />
                Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">You don't have permission to view role permissions</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* All Permissions Grid - Only show if user can view permissions */}
      {hasPermission('view permissions') && rolePermissions.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              All Permissions ({rolePermissions.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Complete list of permissions assigned to this role
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {rolePermissions.map((permission) => (
                <Badge key={permission.id} variant="secondary" className="text-xs">
                  {permission.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RoleDetailPage
