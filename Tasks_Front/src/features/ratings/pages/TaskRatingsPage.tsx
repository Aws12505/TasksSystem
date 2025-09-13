import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useTaskRating } from '../hooks/useTaskRating'
import TaskRatingForm from '../components/TaskRatingForm'
import RatingDisplay from '../components/RatingDisplay'
import { Star } from 'lucide-react'

const TaskRatingsPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>()
  const { 
    taskRatings, 
    taskRatingConfigs, 
    isLoading, 
    createRating 
  } = useTaskRating(taskId!)

  const activeConfig = taskRatingConfigs.find(config => config.is_active)

  const handleCreateRating = async (data: any) => {
    await createRating(data)
  }

  if (!taskId) {
    return <div>Task not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Star className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-sans">Task Ratings</h1>
          <p className="text-muted-foreground">Rate task performance and quality</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Form */}
        <div>
          {activeConfig ? (
            <TaskRatingForm
              taskId={parseInt(taskId)}
              config={activeConfig}
              onSubmit={handleCreateRating}
              isLoading={isLoading}
            />
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No active task rating configuration found</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Existing Ratings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Previous Ratings</h2>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : taskRatings.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No ratings yet for this task</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {taskRatings.map((rating) => (
                <RatingDisplay key={rating.id} rating={rating} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskRatingsPage
