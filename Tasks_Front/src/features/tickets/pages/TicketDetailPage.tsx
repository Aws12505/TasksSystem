// pages/TicketDetailPage.tsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { useTicket } from '../hooks/useTicket'
import { usePermissions } from '@/hooks/usePermissions'
import TicketStatusBadge from '../components/TicketStatusBadge'
import TicketTypeBadge from '../components/TicketTypeBadge'
import TicketPriorityBadge from '../components/TicketPriorityBadge'
import { Edit, ArrowLeft, Ticket as TicketIcon, Calendar, User, UserCheck, UserX, CheckCircle } from 'lucide-react'

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const {
    ticket,
    isLoading,
    error,
    claimTicket,
    completeTicket,
    unassignTicket,
    updateStatus,
  } = useTicket(id!)
  const { hasPermission } = usePermissions()

  // 'complete' or 'unassign' or null; controls the alert dialog
  const [pendingAction, setPendingAction] = React.useState<null | 'complete' | 'unassign'>(null)

  const handleClaim = async () => {
    await claimTicket()
  }

  // Open dialogs instead of window.confirm
  const handleComplete = async () => {
    setPendingAction('complete')
  }

  const handleUnassign = async () => {
    setPendingAction('unassign')
  }

  const handleStatusUpdate = async (status: string) => {
    await updateStatus(status)
  }

  // Confirms whichever action is pending, then closes the dialog
  const confirmPendingAction = async () => {

    if (pendingAction === 'complete') {
      await completeTicket()
    } else if (pendingAction === 'unassign') {
      await unassignTicket()
    }

    setPendingAction(null)
  }

  // Loading (keep page shell + header cadence)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TicketIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="h-8 bg-muted animate-pulse rounded w-56" />
                <div className="h-4 bg-muted animate-pulse rounded w-72 mt-2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tickets
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border lg:col-span-2">
              <CardContent className="p-6 space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded w-28" />
                <div className="h-24 bg-muted animate-pulse rounded" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="h-16 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error (carded inside same shell)
  if (error || !ticket) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-destructive">{error || 'Ticket not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Dynamic copy for the dialog
  const dialogTitle =
    pendingAction === 'complete' ? 'Mark ticket as resolved' :
    pendingAction === 'unassign' ? 'Unassign ticket' :
    ''
  const dialogDescription =
    pendingAction === 'complete'
      ? 'Are you sure you want to mark this ticket as resolved? This action may notify the requester.'
      : pendingAction === 'unassign'
      ? 'Are you sure you want to unassign this ticket? It will become available for others to claim.'
      : ''
  const confirmLabel = pendingAction === 'complete' ? 'Mark Resolved' : 'Unassign'

  const requesterDisplayName = ticket.requester?.name || ticket.requester_name || 'Unknown Requester'
  const requesterInitial = (ticket.requester?.name || ticket.requester_name || 'U').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TicketIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">{ticket.title}</h1>
              <div className="flex items-center gap-2">
                <TicketStatusBadge status={ticket.status} />
                <TicketTypeBadge type={ticket.type} showEstimate />
                <TicketPriorityBadge priority={ticket.priority} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ticket.is_available && (
              <Button variant="outline" size="sm" onClick={handleClaim}>
                <UserCheck className="mr-2 h-4 w-4" />
                Claim Ticket
              </Button>
            )}
            {ticket.is_assigned && ticket.status === 'in_progress' && (
              <Button variant="outline" size="sm" onClick={handleComplete}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Resolved
              </Button>
            )}
            {ticket.is_assigned && ticket.status !== 'resolved' && (
              <Button variant="outline" size="sm" onClick={handleUnassign}>
                <UserX className="mr-2 h-4 w-4" />
                Unassign
              </Button>
            )}
            {hasPermission('edit tickets') && (
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to={`/tickets/${ticket.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/tickets" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tickets
              </Link>
            </Button>
          </div>
        </div>

        {/* Content Grid (2/1 split) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-foreground mt-1">{ticket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <TicketTypeBadge type={ticket.type} showEstimate />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <TicketPriorityBadge priority={ticket.priority} />
                  </div>
                </div>

                {ticket.is_completed && ticket.completed_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Completed At</p>
                    <p className="text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(ticket.completed_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: People & Timeline & Actions */}
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
                    {typeof ticket.requester?.avatar_url === 'string' && ticket.requester?.avatar_url.trim() !== '' && (
                      <AvatarImage
                        src={ticket.requester.avatar_url}
                        alt={ticket.requester.name || 'User avatar'}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {requesterInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {requesterDisplayName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.requester?.email || ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignee */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Assignee
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ticket.assignee ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      {typeof ticket.assignee.avatar_url === 'string' && ticket.assignee.avatar_url.trim() !== '' && (
                        <AvatarImage
                          src={ticket.assignee.avatar_url}
                          alt={ticket.assignee.name || 'User avatar'}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-chart-2 text-white">
                        {ticket.assignee.name?.charAt(0).toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{ticket.assignee.name}</p>
                      <p className="text-sm text-muted-foreground">{ticket.assignee.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No assignee yet</p>
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
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
                {ticket.completed_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Resolved:</span>
                    <span className="text-foreground">
                      {new Date(ticket.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleStatusUpdate('open')}
                    disabled={ticket.status === 'open'}
                  >
                    Mark as Open
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleStatusUpdate('in_progress')}
                    disabled={ticket.status === 'in_progress'}
                  >
                    Mark In Progress
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleStatusUpdate('resolved')}
                    disabled={ticket.status === 'resolved'}
                  >
                    Mark Resolved
                  </Button>
                </CardContent>
              </Card>
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPendingAction}
              className={pendingAction === 'complete'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}
            >
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default TicketDetailPage
