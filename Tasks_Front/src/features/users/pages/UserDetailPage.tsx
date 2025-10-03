import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUser } from '../hooks/useUser'
import { usePermissions } from '@/hooks/usePermissions'
import { Edit, ArrowLeft, Mail, Calendar, Shield, Key, TrendingUp } from 'lucide-react'

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user, userRolesPermissions, isLoading, error } = useUser(id!)
  const { hasPermission } = usePermissions()

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
              <div>
                <div className="h-8 bg-muted animate-pulse rounded w-48" />
                <div className="h-4 bg-muted animate-pulse rounded w-64 mt-2" />
              </div>
            </div>
            <div className="h-9 w-36 bg-muted animate-pulse rounded" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <div className="text-center py-12">
            <p className="text-destructive">{error || 'User not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const userRoles = user.roles || []
  const userPermissions = user.permissions || []
  const allPermissions = userRolesPermissions?.all_permissions || []

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header (match EnhancedAnalyticsPage structure) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              {typeof user.avatar_url === 'string' && user.avatar_url.trim() !== '' && (
              <AvatarImage
              src={user.avatar_url}
              alt={user.name || 'User avatar'}
              className="object-cover"
              />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/users">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Link>
            </Button>
            {hasPermission('view analytics') && (
              <Button asChild variant="outline">
                <Link to={`/analytics/users/${user.id}`}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  User Analytics
                </Link>
              </Button>
            )}
            {hasPermission('edit users') && (
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to={`/users/${user.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit User
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email Verified</p>
                <Badge variant={user.email_verified_at ? 'default' : 'secondary'}>
                  {user.email_verified_at ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Roles ({userRoles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {userRoles.length > 0 ? (
                  userRoles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-2 bg-accent/50 rounded"
                    >
                      <span className="font-medium text-foreground">{role.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {role.permissions?.length || 0} permissions
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No roles assigned</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Direct Permissions */}
          {hasPermission('view permissions') && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Direct Permissions ({userPermissions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userPermissions.length > 0 ? (
                    userPermissions.map((permission) => (
                      <div key={permission.id} className="p-2 bg-accent/50 rounded">
                        <span className="text-sm text-foreground">{permission.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No direct permissions assigned</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* All Permissions Summary */}
        {hasPermission('view permissions') && userRolesPermissions && allPermissions.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">All Permissions ({allPermissions.length})</CardTitle>
              <p className="text-sm text-muted-foreground">
                Combined permissions from roles and direct assignments
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {allPermissions.map((permission) => (
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

export default UserDetailPage
