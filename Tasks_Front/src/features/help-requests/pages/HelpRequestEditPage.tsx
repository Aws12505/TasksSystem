import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHelpRequest } from '../hooks/useHelpRequest'
import { useHelpRequests } from '../hooks/useHelpRequests'
import HelpRequestForm from '../components/HelpRequestForm'
import { ArrowLeft, HelpCircle } from 'lucide-react'

const HelpRequestEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { helpRequest, availableTasks, availableUsers, isLoading, error } = useHelpRequest(id!)
  const { updateHelpRequest } = useHelpRequests()

  const handleUpdateHelpRequest = async (data: any) => {
    if (!helpRequest) return
    const updatedHelpRequest = await updateHelpRequest(helpRequest.id, data)
    if (updatedHelpRequest) {
      navigate(`/help-requests/${helpRequest.id}`)
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

  if (error || !helpRequest) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || 'Help request not found'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/help-requests/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Help Request
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Edit Help Request</h1>
            <p className="text-muted-foreground">Update help request details</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Help Request Information</CardTitle>
          </CardHeader>
          <CardContent>
            <HelpRequestForm
              helpRequest={helpRequest}
              availableTasks={availableTasks}
              availableUsers={availableUsers}
              onSubmit={handleUpdateHelpRequest}
              isLoading={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HelpRequestEditPage
