import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRatingConfigs } from '../hooks/useRatingConfigs'
import RatingConfigForm from '../components/RatingConfigForm'
import { ArrowLeft, Settings } from 'lucide-react'

const CreateRatingConfigPage: React.FC = () => {
  const navigate = useNavigate()
  const { createRatingConfig, isLoading } = useRatingConfigs()

  const handleCreateRatingConfig = async (data: any) => {
    const config = await createRatingConfig(data)
    if (config) {
      navigate(`/rating-configs/${config.id}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/rating-configs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Configurations
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Create Rating Configuration</h1>
            <p className="text-muted-foreground">Set up a new rating system configuration</p>
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
              onSubmit={handleCreateRatingConfig}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateRatingConfigPage
