import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRole } from '../hooks/useRole'
import { usePermissions } from '@/hooks/usePermissions'
import { Edit, ArrowLeft, Shield, Key, Calendar } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const RoleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { role, isLoading, error } = useRole(id!)
  const { hasPermission } = usePermissions()

  const rolePermissions = role?.permissions || []

  // Loading (keep page shell + header cadence)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="h-8 bg-muted animate-pulse rounded w-48" />
                <div className="h-4 bg-muted animate-pulse rounded w-64 mt-2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Roles
              </Button>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-5 bg-muted animate-pulse rounded w-28" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-40" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Error (carded inside same shell)
  if (error || !role) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-destructive">{error || 'Role not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">{role.name}</h1>
              <p className="text-muted-foreground">Role Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasPermission('edit roles') && (
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to={`/roles/${role.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Role
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/roles" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Roles
              </Link>
            </Button>
          </div>
        </div>

        {/* Content Grid (2-up cadence) */}
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

          {/* Permissions summary (guarded by permission) */}
          {hasPermission('view permissions') ? (
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Permissions ({rolePermissions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Custom ScrollArea for permissions list */}
                <ScrollArea className="h-48">
                  <div className="space-y-2 p-4 pr-6">
                    {rolePermissions.length > 0 ? (
                      rolePermissions.map((permission) => (
                        <div key={permission.id} className="p-2 bg-accent/50 rounded">
                          <span className="text-sm text-foreground">{permission.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No permissions assigned
                      </p>
                    )}
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
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
                <p className="text-muted-foreground text-sm">
                  You don't have permission to view role permissions
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* All Permissions Grid (if allowed) */}
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
    </div>
  )
}

export default RoleDetailPage
