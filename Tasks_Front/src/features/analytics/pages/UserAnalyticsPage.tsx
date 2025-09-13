import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserAnalytics } from '../hooks/useUserAnalytics'
import PerformanceMetrics from '../components/PerformanceMetrics'
import { ArrowLeft, User } from 'lucide-react'

const UserAnalyticsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const { userPerformance, isLoading, error } = useUserAnalytics(userId!)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !userPerformance) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || 'User analytics not found'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/analytics">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Analytics
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">
              User Analytics
            </h1>
            <p className="text-muted-foreground">Performance analysis for User #{userId}</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <PerformanceMetrics userPerformance={userPerformance} />

      {/* Recent Final Ratings */}
      {userPerformance.final_ratings.recent_ratings.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Final Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userPerformance.final_ratings.recent_ratings.map((rating, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{rating.final_rating}%</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(rating.period_start).toLocaleDateString()} - {' '}
                      {new Date(rating.period_end).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-20 h-2 bg-accent rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${rating.final_rating}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UserAnalyticsPage
