import React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTasks } from '../hooks/useTasks'
import TaskForm from '../components/TaskForm'
import { ArrowLeft, CheckSquare } from 'lucide-react'

const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sectionId = searchParams.get('section_id')
  const { createTask, isLoading } = useTasks()

  const handleCreateTask = async (data: any) => {
    const task = await createTask(data)
    if (task) {
      navigate(`/tasks/${task.id}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/tasks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CheckSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Create Task</h1>
            <p className="text-muted-foreground">Add a new task to your project</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Task Information</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm
              sectionId={sectionId ? parseInt(sectionId) : undefined}
              onSubmit={handleCreateTask}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateTaskPage
