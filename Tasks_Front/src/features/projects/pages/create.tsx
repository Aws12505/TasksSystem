import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjects } from '../hooks/useProjects'
import ProjectForm from '../components/ProjectForm'
import { ArrowLeft, FolderOpen } from 'lucide-react'

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate()
  const { createProject, isLoading } = useProjects()

  const handleCreateProject = async (data: any) => {
    const project = await createProject(data)
    if (project) {
      navigate(`/projects/${project.id}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FolderOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Create Project</h1>
            <p className="text-muted-foreground">Start a new project</p>
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
              onSubmit={handleCreateProject}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateProjectPage
