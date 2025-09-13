import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRatingConfig } from '../hooks/useRatingConfig'
import { useRatingConfigs } from '../hooks/useRatingConfigs'
import RatingConfigForm from '../components/RatingConfigForm'
import { ArrowLeft, Settings } from 'lucide-react'

const RatingConfigEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { ratingConfig, isLoading, error } = useRatingConfig(id!)
  const { updateRatingConfig } = useRatingConfigs()

  const handleUpdateRatingConfig = async (data: any) => {
    if (!ratingConfig) return
    const updatedConfig = await updateRatingConfig(ratingConfig.id, data)
    if (updatedConfig) {
      navigate(`/rating-configs/${ratingConfig.id}`)
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

  if (error || !ratingConfig) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || 'Rating configuration not found'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/rating-configs/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Configuration
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Edit Configuration</h1>
            <p className="text-muted-foreground">Update {ratingConfig.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Configuration Details</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingConfigForm
              ratingConfig={ratingConfig}
              onSubmit={handleUpdateRatingConfig}
              isLoading={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RatingConfigEditPage
