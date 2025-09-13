import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '../hooks/useUser'
import { useUsers } from '../hooks/useUsers'
import UserForm from '../components/UserForm'
import UserRoles from '../components/UserRoles'
import UserPermissions from '../components/UserPermissions'
import { ArrowLeft, User, Shield, Key } from 'lucide-react'

const UserEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { updateUser } = useUsers()
  const { 
    user, 
    availableRoles, 
    availablePermissions, 
    isLoading, 
    error,
    syncUserRoles,
    syncUserPermissions
  } = useUser(id!)

  const handleUpdateUser = async (data: any) => {
    if (!user) return
    const updatedUser = await updateUser(user.id, data)
    if (updatedUser) {
      navigate(`/users/${user.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || 'User not found'}</p>
      </div>
    )
  }

  // Safe access to arrays
  const userRoles = user.roles || []
  const userPermissions = user.permissions || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/users/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to User
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Edit User</h1>
            <p className="text-muted-foreground">Update {user.name}'s profile and permissions</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <UserForm
                user={user}
                onSubmit={handleUpdateUser}
                isLoading={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <UserRoles
            userRoles={userRoles}
            availableRoles={availableRoles}
            onSave={syncUserRoles}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="permissions">
          <UserPermissions
            userPermissions={userPermissions}
            availablePermissions={availablePermissions}
            onSave={syncUserPermissions}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserEditPage
