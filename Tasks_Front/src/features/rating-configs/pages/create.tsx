// pages/CreateRatingConfigPage.tsx
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
    if (config) navigate(`/rating-configs/${config.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header (parity with EnhancedAnalyticsPage) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">
                Create Rating Configuration
              </h1>
              <p className="text-muted-foreground">Set up a new rating system configuration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild disabled={isLoading}>
              <Link to="/rating-configs" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Configurations
              </Link>
            </Button>
          </div>
        </div>

        {/* Form card (same cadence & spacing) */}
        <div className="max-w-4xl">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Configuration Details</CardTitle>
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
                <RatingConfigForm onSubmit={handleCreateRatingConfig} isLoading={isLoading} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CreateRatingConfigPage
