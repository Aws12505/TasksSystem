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
import { Progress } from '@/components/ui/progress'
import { MoreHorizontal, Edit, Trash2, Eye, Kanban } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePermissions } from '@/hooks/usePermissions'
import ProjectStatusBadge from './ProjectStatusBadge'
import type { Project } from '../../../types/Project'

interface ProjectsListProps {
  projects: Project[]
  isLoading: boolean
  onDelete: (id: number) => Promise<void>
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, isLoading, onDelete }) => {
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

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No projects found</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-foreground">Project</TableHead>
            <TableHead className="text-foreground">Stakeholder</TableHead>
            <TableHead className="text-foreground">Status</TableHead>
            <TableHead className="text-foreground">Progress</TableHead>
            <TableHead className="text-foreground">Created</TableHead>
            <TableHead className="text-foreground w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            // Check available actions based on permissions
            const canView = hasPermission('view projects')
            const canEdit = hasPermission('edit projects')
            const canDelete = hasPermission('delete projects')
            
            const hasAnyAction = canView || canEdit || canDelete

            return (
              <TableRow key={project.id} className="border-border hover:bg-accent/50">
                <TableCell>
                  <div className="space-y-1">
                    <Link
                                            to={`/projects/${project.id}`}
                                            className="text-sm font-medium text-foreground hover:text-primary hover:underline"
                                          >
                    {project.name}
                    </Link>
                    {project.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      {typeof project.stakeholder?.avatar_url === 'string' && project.stakeholder?.avatar_url.trim() !== '' && (
              <AvatarImage
              src={project.stakeholder?.avatar_url}
              alt={project.stakeholder?.name || 'User avatar'}
              className="object-cover"
              />
              )}
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {project.stakeholder?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{project.stakeholder?.name || 'Unassigned'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <ProjectStatusBadge status={project.status} />
                </TableCell>
                <TableCell className="w-32">
                  <div className="flex items-center space-x-2">
                    <Progress value={project.progress_percentage} className="flex-1" />
                    <span className="text-xs text-muted-foreground min-w-[3ch]">
                      {project.progress_percentage}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(project.created_at).toLocaleDateString()}
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
                            <Link to={`/projects/${project.id}`} className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {canView && (
                          <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                            <Link to={`/projects/${project.id}/kanban`} className="flex items-center">
                              <Kanban className="mr-2 h-4 w-4" />
                              Kanban
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {canEdit && (
                          <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                            <Link to={`/projects/${project.id}/edit`} className="flex items-center">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(project.id)}
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

export default ProjectsList
