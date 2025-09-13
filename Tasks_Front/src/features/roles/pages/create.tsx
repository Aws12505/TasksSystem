import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRoles } from '../hooks/useRoles'
import RoleForm from '../components/RoleForm'
import { ArrowLeft, Shield } from 'lucide-react'

const CreateRolePage: React.FC = () => {
  const navigate = useNavigate()
  const { createRole, isLoading } = useRoles()

  const handleCreateRole = async (data: any) => {
    const role = await createRole(data)
    if (role) {
      navigate(`/roles/${role.id}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/roles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roles
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Create Role</h1>
            <p className="text-muted-foreground">Add a new role to the system</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Role Information</CardTitle>
          </CardHeader>
          <CardContent>
            <RoleForm
              onSubmit={handleCreateRole}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateRolePage
