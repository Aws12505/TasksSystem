// pages/UserAnalyticsPage.tsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUserAnalytics } from '../hooks/useUserAnalytics'
import PerformanceMetrics from '../components/PerformanceMetrics'
import { ArrowLeft, User as UserIcon, BarChart3 } from 'lucide-react'

const UserAnalyticsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const { userPerformance, isLoading, error } = useUserAnalytics(userId!)

  // Loading (match page padding + grid rhythm)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="h-8 bg-muted animate-pulse rounded w-48" />
                <div className="h-4 bg-muted animate-pulse rounded w-72 mt-2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild disabled>
                <span className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Analytics
                </span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Error state (centered card like other sections)
  if (error || !userPerformance) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-destructive">{error || 'User analytics not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Success
  const recent = userPerformance.final_ratings?.recent_ratings ?? []
  const avg = userPerformance.final_ratings?.average_rating

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header (parity with EnhancedAnalyticsPage) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">User Analytics</h1>
              <p className="text-muted-foreground">
                Performance analysis for <span className="font-medium">User #{userId}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {typeof avg === 'number' && (
              <Badge variant="secondary" className="text-sm">
                Avg Final Rating: {avg}%
              </Badge>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/analytics" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Analytics
              </Link>
            </Button>
          </div>
        </div>

        {/* Main grid (keep cadence with 1 / 2 columns on lg) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Metrics (spans 2 columns like large panels on Enhanced page) */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <PerformanceMetrics userPerformance={userPerformance} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Final Ratings */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Final Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                {recent.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent ratings
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recent.map((rating: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-foreground">{rating.final_rating}%</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(rating.period_start).toLocaleDateString()} —{' '}
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
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserAnalyticsPage
