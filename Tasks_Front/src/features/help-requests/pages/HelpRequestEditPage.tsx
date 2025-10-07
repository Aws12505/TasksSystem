// pages/HelpRequestEditPage.tsx
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

  // Loading (keeps page shell & header cadence)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="h-8 bg-muted animate-pulse rounded w-48" />
                <div className="h-4 bg-muted animate-pulse rounded w-64 mt-2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Help Request
              </Button>
            </div>
          </div>

          <div className="max-w-2xl">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Help Request Information</CardTitle>
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
      </div>
    )
  }

  // Error (carded inside same shell)
  if (error || !helpRequest) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-destructive">{error || 'Help request not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
              <h1 className="text-3xl font-bold text-foreground font-sans">Edit Help Request</h1>
              <p className="text-muted-foreground">Update help request details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/help-requests/${id}`} className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Help Request
              </Link>
            </Button>
          </div>
        </div>

        {/* Form (same card cadence & spacing) */}
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
    </div>
  )
}

export default HelpRequestEditPage
