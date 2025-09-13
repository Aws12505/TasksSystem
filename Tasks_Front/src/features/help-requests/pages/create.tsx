import React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHelpRequestsStore } from '../stores/helpRequestsStore'
import HelpRequestForm from '../components/HelpRequestForm'
import { ArrowLeft, HelpCircle } from 'lucide-react'

const CreateHelpRequestPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const taskId = searchParams.get('task_id')
  
  const { 
    availableTasks, 
    availableUsers, 
    isLoading, 
    createHelpRequest, 
    fetchAvailableTasks, 
    fetchAvailableUsers 
  } = useHelpRequestsStore()

  React.useEffect(() => {
    fetchAvailableTasks()
    fetchAvailableUsers()
  }, [fetchAvailableTasks, fetchAvailableUsers])

  const handleCreateHelpRequest = async (data: any) => {
    const helpRequest = await createHelpRequest(data)
    if (helpRequest) {
      navigate(`/help-requests/${helpRequest.id}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/help-requests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Help Requests
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Request Help</h1>
            <p className="text-muted-foreground">Get assistance with your tasks</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Help Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <HelpRequestForm
              availableTasks={availableTasks}
              availableUsers={availableUsers}
              taskId={taskId ? parseInt(taskId) : undefined}
              onSubmit={handleCreateHelpRequest}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateHelpRequestPage
