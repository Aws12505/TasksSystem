// pages/ProjectDetailPage.tsx
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

  const handleCreateSection = async (data: CreateSectionRequest): Promise<void> => {
    if (!hasPermission('create sections')) return
    const created = await createSection(data)
    if (created && project) await fetchProjectSections(project.id)
  }

  const handleUpdateSection = async (sid: number, data: UpdateSectionRequest): Promise<void> => {
    if (!hasPermission('edit sections')) return
    const updated = await updateSection(sid, data)
    if (updated && project) await fetchProjectSections(project.id)
  }

  const handleDeleteSection = async (sid: number): Promise<void> => {
    if (!hasPermission('delete sections')) return
    const deleted = await deleteSection(sid)
    if (deleted && project) await fetchProjectSections(project.id)
  }

  const canRateStakeholders = hasAnyPermission(['create stakeholder ratings', 'edit stakeholder ratings'])

  // Loading (keep page shell & header cadence)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="h-8 bg-muted animate-pulse rounded w-48" />
                <div className="h-4 bg-muted animate-pulse rounded w-64 mt-2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted animate-pulse rounded w-40" />
                  <div className="h-24 bg-muted animate-pulse rounded" />
                  <div className="h-6 bg-muted animate-pulse rounded w-28" />
                  <div className="h-3 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border lg:col-span-2">
              <CardContent className="p-6">
                <div className="h-64 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Error (carded inside same shell)
  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-destructive">{error || 'Project not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header (parity with EnhancedAnalyticsPage) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">{project.name}</h1>
              <div className="flex items-center gap-2">
                <ProjectStatusBadge status={project.status} />
                <span className="text-sm text-muted-foreground">{project.progress_percentage}% complete</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/projects" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
            {canRateStakeholders && project.stakeholder_will_rate && (
              <Button asChild variant="outline" size="sm">
                <Link to={`/ratings/projects/${project.id}/stakeholder`}>
                  <Users className="mr-2 h-4 w-4" />
                  Stakeholder Rating
                </Link>
              </Button>
            )}
            {hasPermission('view analytics') && (
              <Button asChild variant="outline" size="sm">
                <Link to={`/analytics/projects/${project.id}`}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Project Analytics
                </Link>
              </Button>
            )}
            {hasPermission('view projects') && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/projects/${project.id}/kanban`}>
                  <Kanban className="mr-2 h-4 w-4" />
                  Kanban View
                </Link>
              </Button>
            )}
            {hasPermission('edit projects') && (
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to={`/projects/${project.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Content Grid (same cadence: 1/2 split on lg) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Project Info */}
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

          {/* Right column: Sections */}
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
    </div>
  )
}

export default ProjectDetailPage
