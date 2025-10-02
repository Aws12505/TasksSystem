// pages/RoleEditPage.tsx
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
    if (updatedRole) navigate(`/roles/${role.id}`)
  }

  const handleSavePermissions = async (
    roleId: number,
    data: { name: string; permissions: string[] }
  ) => {
    return await updateRole(roleId, data)
  }

  // Loading (shell + header cadence)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
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
                Back to Role
              </Button>
            </div>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Role Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 bg-muted animate-pulse rounded" />
                <div className="h-10 bg-muted animate-pulse rounded" />
                <div className="h-24 bg-muted animate-pulse rounded" />
                <div className="flex gap-2">
                  <div className="h-10 bg-muted animate-pulse rounded w-32" />
                  <div className="h-10 bg-muted animate-pulse rounded w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
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
        {/* Header (parity with EnhancedAnalyticsPage) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Edit Role</h1>
              <p className="text-muted-foreground">Update {role.name} and its permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/roles/${id}`} className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Role
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs (same spacing rhythm) */}
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
                <RoleForm role={role} onSubmit={handleUpdateRole} isLoading={false} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <RolePermissions
              role={role}
              availablePermissions={availablePermissions}
              onSave={handleSavePermissions}
              isLoading={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default RoleEditPage
