// pages/ProjectEditPage.tsx
import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProject } from '../hooks/useProject'
import { useProjects } from '../hooks/useProjects'
import ProjectForm from '../components/ProjectForm'
import { ArrowLeft, FolderOpen } from 'lucide-react'

const ProjectEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { project, isLoading, error } = useProject(id!)
  const { updateProject } = useProjects()

  const handleUpdateProject = async (data: any) => {
    if (!project) return
    const updatedProject = await updateProject(project.id, data)
    if (updatedProject) navigate(`/projects/${project.id}`)
  }

  // Loading (keeps page shell & header cadence like EnhancedAnalyticsPage)
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
                Back to Project
              </Button>
            </div>
          </div>

          <div className="max-w-2xl">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Project Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-24 bg-muted animate-pulse rounded" />
                  <div className="flex gap-2">
                    <div className="h-10 bg-muted animate-pulse rounded w-32" />
                    <div className="h-10 bg-muted animate-pulse rounded w-24" />
                  </div>
                </div>
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
              <h1 className="text-3xl font-bold text-foreground font-sans">Edit Project</h1>
              <p className="text-muted-foreground">Update {project.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/projects/${id}`} className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Project
              </Link>
            </Button>
          </div>
        </div>

        {/* Form card (same card cadence & spacing) */}
        <div className="max-w-2xl">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Project Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectForm
                project={project}
                onSubmit={handleUpdateProject}
                isLoading={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProjectEditPage
