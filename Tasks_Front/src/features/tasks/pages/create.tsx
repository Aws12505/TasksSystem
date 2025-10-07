// pages/CreateTaskPage.tsx
import React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTasks } from '../hooks/useTasks'
import ComprehensiveTaskForm from '../components/ComprehensiveTaskForm'
import { ArrowLeft, CheckSquare } from 'lucide-react'

const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sectionId = searchParams.get('section_id')
  const { createTaskComprehensive, isLoading } = useTasks()

  const handleCreateTask = async (data: any) => {
    const task = await createTaskComprehensive(data)
    if (task) navigate(`/tasks/${task.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Create Comprehensive Task</h1>
              <p className="text-muted-foreground">
                Create a task with subtasks and user assignments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild disabled={isLoading}>
              <Link to="/tasks" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tasks
              </Link>
            </Button>
          </div>
        </div>

        {/* Form card (same cadence & spacing) */}
        <div className="max-w-4xl">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Task Details</CardTitle>
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
                <ComprehensiveTaskForm
                  sectionId={sectionId ? parseInt(sectionId, 10) : undefined}
                  onSubmit={handleCreateTask}
                  isLoading={isLoading}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CreateTaskPage
