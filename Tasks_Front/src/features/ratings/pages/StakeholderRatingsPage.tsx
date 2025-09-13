import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useStakeholderRating } from '../hooks/useStakeholderRating'
import StakeholderRatingForm from '../components/StakeholderRatingForm'
import RatingDisplay from '../components/RatingDisplay'
import { Users } from 'lucide-react'

const StakeholderRatingsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { 
    stakeholderRatings, 
    stakeholderRatingConfigs, 
    isLoading, 
    createRating 
  } = useStakeholderRating(projectId!)

  const activeConfig = stakeholderRatingConfigs.find(config => config.is_active)

  const handleCreateRating = async (data: any) => {
    await createRating(data)
  }

  if (!projectId) {
    return <div>Project not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-sans">Stakeholder Ratings</h1>
          <p className="text-muted-foreground">Project evaluation from stakeholder perspective</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Form */}
        <div>
          {activeConfig ? (
            <StakeholderRatingForm
              projectId={parseInt(projectId)}
              config={activeConfig}
              onSubmit={handleCreateRating}
              isLoading={isLoading}
            />
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No active stakeholder rating configuration found</p>
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
          ) : stakeholderRatings.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No ratings yet for this project</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {stakeholderRatings.map((rating) => (
                <RatingDisplay key={rating.id} rating={rating} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StakeholderRatingsPage
