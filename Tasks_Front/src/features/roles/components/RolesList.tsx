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
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePermissions } from '@/hooks/usePermissions'
import type { Role } from '../../../types/Role'

interface RolesListProps {
  roles: Role[]
  isLoading: boolean
  onDelete: (id: number) => Promise<void>
}

const RolesList: React.FC<RolesListProps> = ({ roles, isLoading, onDelete }) => {
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

  if (roles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No roles found</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-foreground">Role Name</TableHead>
            <TableHead className="text-foreground">Permissions</TableHead>
            <TableHead className="text-foreground">Guard Name</TableHead>
            <TableHead className="text-foreground">Created</TableHead>
            <TableHead className="text-foreground w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => {
            // Check available actions based on permissions
            const canView = hasPermission('view roles')
            const canEdit = hasPermission('edit roles')
            const canDelete = hasPermission('delete roles')
            
            const hasAnyAction = canView || canEdit || canDelete

            return (
              <TableRow key={role.id} className="border-border hover:bg-accent/50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-medium text-sm">
                        {role.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{role.name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {hasPermission('view permissions') ? (
                    <Badge variant="secondary" className="text-xs">
                      {role.permissions?.length || 0} permissions
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Hidden
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {role.guard_name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(role.created_at).toLocaleDateString()}
                </TableCell>
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
                            <Link to={`/roles/${role.id}`} className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {canEdit && (
                          <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                            <Link to={`/roles/${role.id}/edit`} className="flex items-center">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(role.id)}
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
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default RolesList
