// pages/CreateProjectPage.tsx
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
    if (project) navigate(`/projects/${project.id}`)
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
              <h1 className="text-3xl font-bold text-foreground font-sans">Create Project</h1>
              <p className="text-muted-foreground">Start a new project</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild disabled={isLoading}>
              <Link to="/projects" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
          </div>
        </div>

        {/* Form card (same cadence & spacing) */}
        <div className="max-w-2xl">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Project Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-24 bg-muted animate-pulse rounded" />
                  <div className="flex gap-2">
                    <div className="h-10 bg-muted animate-pulse rounded w-32" />
                    <div className="h-10 bg-muted animate-pulse rounded w-24" />
                  </div>
                </div>
              ) : (
                <ProjectForm onSubmit={handleCreateProject} isLoading={isLoading} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectPage
