import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRole } from '../hooks/useRole'
import { useRoles } from '../hooks/useRoles'
import RoleForm from '../components/RoleForm'
import RolePermissions from '../components/RolePermissions'
import { ArrowLeft, Shield, Key } from 'lucide-react'

const RoleEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { updateRole } = useRoles()
  const { role, availablePermissions, isLoading, error } = useRole(id!)

  const handleUpdateRole = async (data: any) => {
    if (!role) return
    const updatedRole = await updateRole(role.id, data)
    if (updatedRole) {
      navigate(`/roles/${role.id}`)
    }
  }

  const handleSavePermissions = async (roleId: number, data: { name: string; permissions: string[] }) => {
    return await updateRole(roleId, data)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/roles/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Role
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Edit Role</h1>
            <p className="text-muted-foreground">Update {role.name} and its permissions</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Role Details
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Role Information</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleForm
                role={role}
                onSubmit={handleUpdateRole}
                isLoading={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <RolePermissions
            role={role}
            availablePermissions={availablePermissions}
            onSave={handleSavePermissions}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RoleEditPage
