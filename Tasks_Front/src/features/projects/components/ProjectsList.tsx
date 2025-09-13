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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { MoreHorizontal, Edit, Trash2, Eye, BarChart3 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ProjectStatusBadge from './ProjectStatusBadge'
import type { Project } from '../../../types/Project'

interface ProjectsListProps {
  projects: Project[]
  isLoading: boolean
  onDelete: (id: number) => Promise<void>
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, isLoading, onDelete }) => {
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
          {projects.map((project) => (
            <TableRow key={project.id} className="border-border hover:bg-accent/50">
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{project.name}</p>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-accent">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border">
                    <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                      <Link to={`/projects/${project.id}`} className="flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
    <Link to={`/analytics/projects/${project.id}`} className="flex items-center">
      <BarChart3 className="mr-2 h-4 w-4" />
      Analytics
    </Link>
  </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                      <Link to={`/projects/${project.id}/edit`} className="flex items-center">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(project.id)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ProjectsList
