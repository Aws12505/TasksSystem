import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useProject } from '../hooks/useProject'
import { usePermissions } from '@/hooks/usePermissions'
import { useSectionsStore } from '../../sections/stores/sectionsStore'
import ProjectStatusBadge from '../components/ProjectStatusBadge'
import SectionsList from '../components/SectionsList'
import type { CreateSectionRequest, UpdateSectionRequest } from '../../../types/Section'
import { Edit, ArrowLeft, FolderOpen, Calendar, CheckSquare, Users, BarChart3, Kanban } from 'lucide-react'
import { useProjectsStore } from '../../projects/stores/projectsStore'

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { project, sections, isLoading, error } = useProject(id!)
  const { createSection, updateSection, deleteSection } = useSectionsStore()
  const { hasPermission, hasAnyPermission } = usePermissions()
  const { fetchProjectSections } = useProjectsStore()

  // Wrapper functions to match expected Promise<void> return type
  const handleCreateSection = async (data: CreateSectionRequest): Promise<void> => {
    if (!hasPermission('create sections')) return
    const created = await createSection(data)
    if (created && !!project) {
      await fetchProjectSections(project.id) // <- refresh the list you actually render
    }
  }

  const handleUpdateSection = async (id: number, data: UpdateSectionRequest): Promise<void> => {
    if (!hasPermission('edit sections')) return
    const updated = await updateSection(id, data)
    if (updated && !!project) {
      await fetchProjectSections(project.id) // <- refresh the list you actually render
    }
  }

  const handleDeleteSection = async (id: number): Promise<void> => {
    if (!hasPermission('delete sections')) return
    const deleted = await deleteSection(id)
    if (deleted && !!project) {
      await fetchProjectSections(project.id) // <- refresh the list you actually render
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || 'Project not found'}</p>
      </div>
    )
  }

  const canRateStakeholders = hasAnyPermission(['create stakeholder ratings', 'edit stakeholder ratings'])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-sans">{project.name}</h1>
              <div className="flex items-center gap-2">
                <ProjectStatusBadge status={project.status} />
                <span className="text-sm text-muted-foreground">
                  {project.progress_percentage}% complete
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canRateStakeholders && project.stakeholder_will_rate && (
            <Button asChild variant="outline">
              <Link to={`/ratings/projects/${project.id}/stakeholder`}>
                <Users className="mr-2 h-4 w-4" />
                Stakeholder Rating
              </Link>
            </Button>
          )}
          {hasPermission('view analytics') && (
            <Button asChild variant="outline">
              <Link to={`/analytics/projects/${project.id}`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Project Analytics
              </Link>
            </Button>
          )}
          {hasPermission('view projects') && (
            <Button variant="outline" asChild>
              <Link to={`/projects/${project.id}/kanban`}>
                <Kanban className="mr-2 h-4 w-4" />
                Kanban View
              </Link>
            </Button>
          )}
          {hasPermission('edit projects') && (
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to={`/projects/${project.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-foreground">{project.description}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground">Stakeholder</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {project.stakeholder?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {project.stakeholder?.name || 'Unassigned'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.stakeholder?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <Progress value={project.progress_percentage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {project.progress_percentage}% complete
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Will be rated</p>
                <div className="flex items-center gap-2 mt-1">
                  <CheckSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {project.stakeholder_will_rate ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sections */}
        <div className="lg:col-span-2">
          {hasPermission('view sections') ? (
            <SectionsList
              sections={sections ?? []}
              projectId={project.id}
              onCreateSection={handleCreateSection}
              onUpdateSection={handleUpdateSection}
              onDeleteSection={handleDeleteSection}
              isLoading={false}
            />
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">You don't have permission to view sections</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailPage
