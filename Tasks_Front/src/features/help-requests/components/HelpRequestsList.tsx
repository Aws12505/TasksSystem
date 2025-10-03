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
import { MoreHorizontal, Edit, Trash2, Eye, UserCheck, UserX } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePermissions } from '@/hooks/usePermissions'
import HelpRequestStatusBadge from './HelpRequestStatusBadge'
import HelpRequestRatingBadge from './HelpRequestRatingBadge'
import type { HelpRequest } from '../../../types/HelpRequest'

interface HelpRequestsListProps {
  helpRequests: HelpRequest[]
  isLoading: boolean
  onDelete: (id: number) => Promise<void>
  onClaim: (id: number) => Promise<void>
  onUnclaim: (id: number) => Promise<void>
  showActions?: boolean
}

const HelpRequestsList: React.FC<HelpRequestsListProps> = ({ 
  helpRequests, 
  isLoading, 
  onDelete, 
  onClaim, 
  onUnclaim,
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

  if (helpRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No help requests found</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-foreground">Description</TableHead>
            <TableHead className="text-foreground">Task</TableHead>
            <TableHead className="text-foreground">Requester</TableHead>
            <TableHead className="text-foreground">Helper</TableHead>
            <TableHead className="text-foreground">Status</TableHead>
            <TableHead className="text-foreground">Rating</TableHead>
            <TableHead className="text-foreground">Created</TableHead>
            {showActions && <TableHead className="text-foreground w-[50px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {helpRequests.map((helpRequest) => {
            // Check available actions based on permissions
            const canView = hasPermission('view help requests')
            const canEdit = hasPermission('edit help requests')
            const canDelete = hasPermission('delete help requests')
            // const canClaim = hasPermission('claim help requests')
            
            const hasAnyAction = canView || canEdit || canDelete 

            return (
              <TableRow key={helpRequest.id} className="border-border hover:bg-accent/50">
                <TableCell>
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {helpRequest.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {helpRequest.task?.name || 'Unknown Task'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {helpRequest.task?.section?.project?.name || 'Unknown Project'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      {typeof helpRequest.requester?.avatar_url === 'string' && helpRequest.requester?.avatar_url.trim() !== '' && (
              <AvatarImage
              src={helpRequest.requester?.avatar_url}
              alt={helpRequest.requester?.name || 'User avatar'}
              className="object-cover"
              />
              )}
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {helpRequest.requester?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">
                      {helpRequest.requester?.name || 'Unknown User'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {helpRequest.helper ? (
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        {typeof helpRequest.helper.avatar_url === 'string' && helpRequest.helper.avatar_url.trim() !== '' && (
              <AvatarImage
              src={helpRequest.helper.avatar_url}
              alt={helpRequest.helper.name || 'User avatar'}
              className="object-cover"
              />
              )}
                        <AvatarFallback className="bg-chart-2 text-white text-xs">
                          {helpRequest.helper.name?.charAt(0).toUpperCase() || 'H'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">
                        {helpRequest.helper.name}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Unassigned
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <HelpRequestStatusBadge helpRequest={helpRequest} />
                </TableCell>
                <TableCell>
                  {helpRequest.rating ? (
                    <HelpRequestRatingBadge 
                      rating={helpRequest.rating} 
                      penaltyMultiplier={helpRequest.penalty_multiplier}
                    />
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Not Rated
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(helpRequest.created_at).toLocaleDateString()}
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
                              <Link to={`/help-requests/${helpRequest.id}`} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canEdit && (
                            <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                              <Link to={`/help-requests/${helpRequest.id}/edit`} className="flex items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                          )}
                          { helpRequest.is_available && (
                            <DropdownMenuItem
                              onClick={() => onClaim(helpRequest.id)}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Claim
                            </DropdownMenuItem>
                          )}
                          { helpRequest.is_claimed && !helpRequest.is_completed && (
                            <DropdownMenuItem
                              onClick={() => onUnclaim(helpRequest.id)}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Unclaim
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(helpRequest.id)}
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

export default HelpRequestsList
