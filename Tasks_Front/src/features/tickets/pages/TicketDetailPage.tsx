import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useTicket } from '../hooks/useTicket'
import { usePermissions } from '@/hooks/usePermissions'
import TicketStatusBadge from '../components/TicketStatusBadge'
import TicketTypeBadge from '../components/TicketTypeBadge'
import TicketPriorityBadge from '../components/TicketPriorityBadge'
import { Edit, ArrowLeft, Ticket, Calendar, User, UserCheck, UserX, CheckCircle } from 'lucide-react'

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { 
    ticket, 
    isLoading, 
    error,
    claimTicket,
    completeTicket,
    unassignTicket,
    updateStatus
  } = useTicket(id!)
  const { hasPermission } = usePermissions()

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

  if (error || !ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || 'Ticket not found'}</p>
      </div>
    )
  }

  const handleClaim = async () => {
    if (!hasPermission('edit tickets')) return
    await claimTicket()
  }

  const handleComplete = async () => {
    if (!hasPermission('edit tickets')) return
    
    if (window.confirm('Are you sure you want to mark this ticket as resolved?')) {
      await completeTicket()
    }
  }

  const handleUnassign = async () => {
    if (!hasPermission('edit tickets')) return
    
    if (window.confirm('Are you sure you want to unassign this ticket?')) {
      await unassignTicket()
    }
  }

  const handleStatusUpdate = async (status: string) => {
    if (!hasPermission('edit tickets')) return
    await updateStatus(status)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/tickets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tickets
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-sans">{ticket.title}</h1>
              <div className="flex items-center gap-2">
                <TicketStatusBadge status={ticket.status} />
                <TicketTypeBadge type={ticket.type} showEstimate />
                <TicketPriorityBadge priority={ticket.priority} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission('edit tickets') && ticket.is_available && (
            <Button variant="outline" size="sm" onClick={handleClaim}>
              <UserCheck className="mr-2 h-4 w-4" />
              Claim Ticket
            </Button>
          )}
          {hasPermission('edit tickets') && ticket.is_assigned && ticket.status === 'in_progress' && (
            <Button variant="outline" size="sm" onClick={handleComplete}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Resolved
            </Button>
          )}
          {hasPermission('edit tickets') && ticket.is_assigned && ticket.status !== 'resolved' && (
            <Button variant="outline" size="sm" onClick={handleUnassign}>
              <UserX className="mr-2 h-4 w-4" />
              Unassign
            </Button>
          )}
          {hasPermission('edit tickets') && (
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to={`/tickets/${ticket.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Details */}
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

        {/* People & Timeline */}
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
                    {ticket.requester?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">
                    {ticket.requester?.name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.requester?.email}
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
                    <AvatarFallback className="bg-chart-2 text-white">
                      {ticket.assignee.name?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {ticket.assignee.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.assignee.email}
                    </p>
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
          {hasPermission('edit tickets') && (
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
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketDetailPage
