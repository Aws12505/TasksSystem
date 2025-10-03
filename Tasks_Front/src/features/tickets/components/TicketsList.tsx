import React from 'react'
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Edit, Trash2, Eye, UserCheck, UserX, CheckCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePermissions } from '@/hooks/usePermissions'
import TicketStatusBadge from './TicketStatusBadge'
import TicketTypeBadge from './TicketTypeBadge'
import TicketPriorityBadge from './TicketPriorityBadge'
import type { Ticket } from '../../../types/Ticket'

interface TicketsListProps {
  tickets: Ticket[]
  isLoading: boolean
  onDelete: (id: number) => Promise<void>
  onClaim: (id: number) => Promise<void>
  onAssign: (id: number, userId: number) => Promise<void>
  onComplete: (id: number) => Promise<void>
  onUnassign: (id: number) => Promise<void>
  showActions?: boolean
}

const TicketsList: React.FC<TicketsListProps> = ({ 
  tickets, 
  isLoading, 
  onDelete, 
  onClaim,
  onComplete,
  onUnassign,
  showActions = true 
}) => {
  const { hasPermission } = usePermissions()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tickets found</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-foreground">Title</TableHead>
            <TableHead className="text-foreground">Type</TableHead>
            <TableHead className="text-foreground">Status</TableHead>
            <TableHead className="text-foreground">Priority</TableHead>
            <TableHead className="text-foreground">Requester</TableHead>
            <TableHead className="text-foreground">Assignee</TableHead>
            <TableHead className="text-foreground">Created</TableHead>
            {showActions && <TableHead className="text-foreground w-[50px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => {
            // Check available actions based on permissions
            const canView = hasPermission('view tickets')
            const canEdit = hasPermission('edit tickets')
            const canDelete = hasPermission('delete tickets')
            
            const hasAnyAction = canView || canEdit || canDelete

            return (
              <TableRow key={ticket.id} className="border-border hover:bg-accent/50">
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <TicketTypeBadge type={ticket.type} />
                </TableCell>
                <TableCell>
                  <TicketStatusBadge status={ticket.status} />
                </TableCell>
                <TableCell>
                  <TicketPriorityBadge priority={ticket.priority} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      {typeof ticket.requester?.avatar_url === 'string' && ticket.requester?.avatar_url.trim() !== '' && (
              <AvatarImage
              src={ticket.requester?.avatar_url}
              alt={ticket.requester?.name || 'User avatar'}
              className="object-cover"
              />
              )}
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {ticket.requester?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">
                      {ticket.requester?.name || 'Unknown User'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {ticket.assignee ? (
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        {typeof ticket.assignee.avatar_url === 'string' && ticket.assignee.avatar_url.trim() !== '' && (
              <AvatarImage
              src={ticket.assignee.avatar_url}
              alt={ticket.assignee.name || 'User avatar'}
              className="object-cover"
              />
              )}
                        <AvatarFallback className="bg-chart-2 text-white text-xs">
                          {ticket.assignee.name?.charAt(0).toUpperCase() || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">
                        {ticket.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Unassigned
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </TableCell>
                {showActions && (
                  <TableCell>
                    {hasAnyAction ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-accent">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          {canView && (
                            <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                              <Link to={`/tickets/${ticket.id}`} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canEdit && (
                            <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                              <Link to={`/tickets/${ticket.id}/edit`} className="flex items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canEdit && ticket.is_available && (
                            <DropdownMenuItem
                              onClick={() => onClaim(ticket.id)}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Claim
                            </DropdownMenuItem>
                          )}
                          {canEdit && ticket.is_assigned && ticket.status === 'in_progress' && (
                            <DropdownMenuItem
                              onClick={() => onComplete(ticket.id)}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Complete
                            </DropdownMenuItem>
                          )}
                          {canEdit && ticket.is_assigned && ticket.status !== 'resolved' && (
                            <DropdownMenuItem
                              onClick={() => onUnassign(ticket.id)}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Unassign
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(ticket.id)}
                              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-muted-foreground text-xs">No actions</span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default TicketsList
