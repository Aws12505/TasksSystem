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
    if (updatedProject) {
      navigate(`/projects/${project.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/projects/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FolderOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Edit Project</h1>
            <p className="text-muted-foreground">Update {project.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
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
  )
}

export default ProjectEditPage
