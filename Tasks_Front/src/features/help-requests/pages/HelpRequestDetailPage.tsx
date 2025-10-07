// pages/HelpRequestDetailPage.tsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useHelpRequest } from '../hooks/useHelpRequest'
import HelpRequestStatusBadge from '../components/HelpRequestStatusBadge'
import HelpRequestRatingBadge from '../components/HelpRequestRatingBadge'
import CompleteHelpRequestModal from '../components/CompleteHelpRequestModal'
import {
  Edit,
  ArrowLeft,
  HelpCircle,
  Calendar,
  User as UserIcon,
  CheckSquare,
  UserCheck,
  UserX,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/stores/authStore'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const HelpRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const {
    helpRequest,
    ratingOptions,
    isLoading,
    error,
    claimRequest,
    completeRequest,
    unclaimRequest,
  } = useHelpRequest(id!)
  const { user: currentUser } = useAuthStore()

  const isHelper = !!currentUser && !!helpRequest && currentUser.id === helpRequest.helper_id
  const canUnclaim  = !!helpRequest && helpRequest.is_claimed && !helpRequest.is_completed && isHelper
  const canComplete = !!helpRequest && helpRequest.is_claimed && !helpRequest.is_completed && isHelper
  const canClaim    = !!helpRequest && helpRequest.is_available

  // Use shadcn AlertDialog instead of window.confirm for unclaim
  const [unclaimOpen, setUnclaimOpen] = React.useState(false)

  const handleClaim = async () => {
    if (canClaim) await claimRequest()
  }

  const handleOpenUnclaim = () => {
    if (canUnclaim) setUnclaimOpen(true)
  }

  const confirmUnclaim = async () => {
    if (canUnclaim) {
      await unclaimRequest()
      setUnclaimOpen(false)
    }
  }

  const handleComplete = async (data: { rating: any }) => {
    if (canComplete) await completeRequest(data)
  }

  // Loading (keep page shell + header cadence)
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
                Back to Help Requests
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border lg:col-span-2">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted animate-pulse rounded w-40" />
                  <div className="h-24 bg-muted animate-pulse rounded" />
                  <div className="h-16 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="h-12 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="h-12 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="h-24 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            </div>
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
              <h1 className="text-3xl font-bold text-foreground font-sans">
                Help Request #{helpRequest.id}
              </h1>
              <HelpRequestStatusBadge helpRequest={helpRequest} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canClaim && (
              <Button variant="outline" size="sm" onClick={handleClaim}>
                <UserCheck className="mr-2 h-4 w-4" />
                Claim
              </Button>
            )}
            {canUnclaim && (
              <Button variant="outline" size="sm" onClick={handleOpenUnclaim}>
                <UserX className="mr-2 h-4 w-4" />
                Unclaim
              </Button>
            )}
            {canComplete && (
              <CompleteHelpRequestModal
                ratingOptions={ratingOptions}
                onComplete={handleComplete}
                isLoading={isLoading}
              />
            )}
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
              <Link to={`/help-requests/${helpRequest.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/help-requests" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Help Requests
              </Link>
            </Button>
          </div>
        </div>

        {/* Content Grid (same cadence as other pages) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Details (spans 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Rating Info (full width under details) */}
            {helpRequest.rating && (
              <Card className="bg-card border-border">
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

          {/* Right column */}
          <div className="space-y-6">
            {/* Requester */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Requester
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    {typeof helpRequest.requester?.avatar_url === 'string' && helpRequest.requester?.avatar_url.trim() !== '' && (
              <AvatarImage
              src={helpRequest.requester?.avatar_url}
              alt={helpRequest.requester?.name || 'User avatar'}
              className="object-cover"
              />
              )}
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
                      {typeof helpRequest.helper.avatar_url === 'string' && helpRequest.helper.avatar_url.trim() !== '' && (
              <AvatarImage
              src={helpRequest.helper.avatar_url}
              alt={helpRequest.helper.name || 'User avatar'}
              className="object-cover"
              />
              )}
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

      {/* Unclaim confirmation dialog (centered) */}
      <AlertDialog open={unclaimOpen} onOpenChange={(open) => !open && setUnclaimOpen(false)}>
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Unclaim help request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unclaim this help request? It will become available for others to claim.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUnclaimOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnclaim}>
              Unclaim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default HelpRequestDetailPage
