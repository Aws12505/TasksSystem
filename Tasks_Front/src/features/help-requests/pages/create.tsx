// pages/CreateHelpRequestPage.tsx
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
    fetchAvailableUsers,
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
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Request Help</h1>
              <p className="text-muted-foreground">Get assistance with your tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild disabled={isLoading}>
              <Link to="/help-requests" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Help Requests
              </Link>
            </Button>
          </div>
        </div>

        {/* Form card (same card cadence & spacing) */}
        <div className="max-w-2xl">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Help Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-24 bg-muted animate-pulse rounded" />
                  <div className="flex gap-2">
                    <div className="h-10 bg-muted animate-pulse rounded w-32" />
                    <div className="h-10 bg-muted animate-pulse rounded w-24" />
                  </div>
                </div>
              ) : (
                <HelpRequestForm
                  availableTasks={availableTasks}
                  availableUsers={availableUsers}
                  taskId={taskId ? parseInt(taskId) : undefined}
                  onSubmit={handleCreateHelpRequest}
                  isLoading={isLoading}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CreateHelpRequestPage
