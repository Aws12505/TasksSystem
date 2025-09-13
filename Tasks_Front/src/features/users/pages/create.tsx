import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUsers } from '../hooks/useUsers'
import UserForm from '../components/UserForm'
import { ArrowLeft, UserPlus } from 'lucide-react'

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate()
  const { createUser, isLoading } = useUsers()

  const handleCreateUser = async (data: any) => {
    const user = await createUser(data)
    if (user) {
      navigate(`/users/${user.id}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Create User</h1>
            <p className="text-muted-foreground">Add a new user to the system</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <UserForm
              onSubmit={handleCreateUser}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateUserPage
