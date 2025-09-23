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
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MoreHorizontal, Edit, Trash2, Eye, Play } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePermissions } from '@/hooks/usePermissions'
import RatingConfigTypeBadge from './RatingConfigTypeBadge'
import type { RatingConfig } from '../../../types/RatingConfig'

interface RatingConfigsListProps {
  ratingConfigs: RatingConfig[]
  isLoading: boolean
  onDelete: (id: number) => Promise<void>
  onActivate: (id: number) => Promise<void>
  showActions?: boolean
}

const RatingConfigsList: React.FC<RatingConfigsListProps> = ({ 
  ratingConfigs, 
  isLoading, 
  onDelete, 
  onActivate,
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

  if (ratingConfigs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No rating configurations found</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-foreground">Name</TableHead>
            <TableHead className="text-foreground">Type</TableHead>
            <TableHead className="text-foreground">Status</TableHead>
            <TableHead className="text-foreground">Creator</TableHead>
            <TableHead className="text-foreground">Created</TableHead>
            {showActions && <TableHead className="text-foreground w-[50px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ratingConfigs.map((config) => {
            // Check available actions based on permissions
            const canView = hasPermission('view rating configs')
            const canEdit = hasPermission('edit rating configs')
            const canDelete = hasPermission('delete rating configs')
            
            const hasAnyAction = canView || canEdit || canDelete

            return (
              <TableRow key={config.id} className="border-border hover:bg-accent/50">
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{config.name}</p>
                    {config.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {config.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <RatingConfigTypeBadge type={config.type} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={config.is_active ? 'default' : 'secondary'}
                      className={config.is_active ? 'text-green-600 bg-green-100' : ''}
                    >
                      {config.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {config.creator?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">
                      {config.creator?.name || 'Unknown User'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(config.created_at).toLocaleDateString()}
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
                              <Link to={`/rating-configs/${config.id}`} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canEdit && (
                            <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                              <Link to={`/rating-configs/${config.id}/edit`} className="flex items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canEdit && !config.is_active && (
                            <DropdownMenuItem
                              onClick={() => onActivate(config.id)}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(config.id)}
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

export default RatingConfigsList
