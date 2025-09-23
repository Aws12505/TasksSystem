import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useHelpRequest } from '../hooks/useHelpRequest'
// import { usePermissions } from '@/hooks/usePermissions'
import HelpRequestStatusBadge from '../components/HelpRequestStatusBadge'
import HelpRequestRatingBadge from '../components/HelpRequestRatingBadge'
import CompleteHelpRequestModal from '../components/CompleteHelpRequestModal'
import { Edit, ArrowLeft, HelpCircle, Calendar, User, CheckSquare, UserCheck, UserX } from 'lucide-react'

const HelpRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { 
    helpRequest, 
    ratingOptions,
    isLoading, 
    error,
    claimRequest,
    completeRequest,
    unclaimRequest
  } = useHelpRequest(id!)
  // const { hasPermission } = usePermissions()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
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

  const handleClaim = async () => {
    // if (!hasPermission('claim help requests')) return
    await claimRequest()
  }

  const handleUnclaim = async () => {
    // if (!hasPermission('claim help requests')) return
    
    if (window.confirm('Are you sure you want to unclaim this help request?')) {
      await unclaimRequest()
    }
  }

  const handleComplete = async (data: { rating: any }) => {
    // if (!hasPermission('complete help requests')) return
    await completeRequest(data)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/help-requests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Help Requests
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-sans">Help Request #{helpRequest.id}</h1>
              <HelpRequestStatusBadge helpRequest={helpRequest} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          { helpRequest.is_available && (
            <Button variant="outline" size="sm" onClick={handleClaim}>
              <UserCheck className="mr-2 h-4 w-4" />
              Claim Request
            </Button>
          )}
          { helpRequest.is_claimed && !helpRequest.is_completed && (
            <Button variant="outline" size="sm" onClick={handleUnclaim}>
              <UserX className="mr-2 h-4 w-4" />
              Unclaim
            </Button>
          )}
          { helpRequest.is_claimed && !helpRequest.is_completed && (
            <CompleteHelpRequestModal
              ratingOptions={ratingOptions}
              onComplete={handleComplete}
              isLoading={isLoading}
            />
          )}
          { (
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to={`/help-requests/${helpRequest.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Details */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-foreground mt-1">{helpRequest.description}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Related Task</p>
                <div className="mt-1">
                  <p className="font-medium text-foreground">
                    {helpRequest.task?.name || 'Unknown Task'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Project: {helpRequest.task?.section?.project?.name || 'Unknown Project'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Section: {helpRequest.task?.section?.name || 'Unknown Section'}
                  </p>
                </div>
              </div>

              {helpRequest.is_completed && helpRequest.completed_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Completed At</p>
                  <p className="text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(helpRequest.completed_at).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating Info */}
          {helpRequest.rating && (
            <Card className="bg-card border-border mt-6">
              <CardHeader>
                <CardTitle className="text-foreground">Request Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <HelpRequestRatingBadge 
                  rating={helpRequest.rating} 
                  penaltyMultiplier={helpRequest.penalty_multiplier}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* People Involved */}
        <div className="space-y-6">
          {/* Requester */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Requester
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {helpRequest.requester?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">
                    {helpRequest.requester?.name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {helpRequest.requester?.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Helper */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Helper
              </CardTitle>
            </CardHeader>
            <CardContent>
              {helpRequest.helper ? (
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-chart-2 text-white">
                      {helpRequest.helper.name?.charAt(0).toUpperCase() || 'H'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {helpRequest.helper.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {helpRequest.helper.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No helper assigned yet</p>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="text-foreground">
                  {new Date(helpRequest.created_at).toLocaleDateString()}
                </span>
              </div>
              {helpRequest.completed_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="text-foreground">
                    {new Date(helpRequest.completed_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default HelpRequestDetailPage
