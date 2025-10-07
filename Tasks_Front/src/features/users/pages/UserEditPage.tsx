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
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="h-8 bg-muted animate-pulse rounded w-48" />
                <div className="h-4 bg-muted animate-pulse rounded w-64 mt-2" />
              </div>
            </div>
            <div className="h-9 w-36 bg-muted animate-pulse rounded" />
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted animate-pulse rounded-lg" />
            </CardContent>
          </Card>
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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Edit User</h1>
              <p className="text-muted-foreground">
                Update <span className="font-medium">{user.name}</span>'s profile and permissions
              </p>
            </div>
          </div>

          {/* Right-side action */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/users/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to User
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs (same spacing cadence) */}
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
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <UserRoles
                  userRoles={userRoles}
                  availableRoles={availableRoles}
                  onSave={syncUserRoles}
                  isLoading={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <UserPermissions
                  userPermissions={userPermissions}
                  availablePermissions={availablePermissions}
                  onSave={syncUserPermissions}
                  isLoading={false}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default UserEditPage
