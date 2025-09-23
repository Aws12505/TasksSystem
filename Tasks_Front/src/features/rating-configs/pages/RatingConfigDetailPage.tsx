import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useRatingConfig } from '../hooks/useRatingConfig'
import { usePermissions } from '@/hooks/usePermissions'
import RatingConfigTypeBadge from '../components/RatingConfigTypeBadge'
import { Edit, ArrowLeft, Settings, Calendar, User, Play, Code } from 'lucide-react'
import type { 
  TaskRatingConfigData, 
  StakeholderRatingConfigData, 
  FinalRatingConfigData 
} from '../../../types/RatingConfig'

const RatingConfigDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { ratingConfig, isLoading, error, activateConfig } = useRatingConfig(id!)
  const { hasPermission } = usePermissions()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
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

  const handleActivate = async () => {
    if (!hasPermission('edit rating configs')) return
    
    if (window.confirm('Are you sure you want to activate this configuration?')) {
      await activateConfig()
    }
  }

  const renderConfigData = () => {
    if (ratingConfig.type === 'final_rating') {
      const configData = ratingConfig.config_data as FinalRatingConfigData
      return (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Code className="w-4 h-4" />
              Formula Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Expression</p>
              <div className="mt-1 p-3 bg-accent/20 rounded-lg">
                <code className="text-sm font-mono text-foreground">
                  {configData.expression}
                </code>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-3">Variables ({configData.variables.length})</p>
              <div className="space-y-3">
                {configData.variables.map((variable, index) => (
                  <div key={index} className="p-3 border border-border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Variable Name</p>
                        <p className="text-sm font-mono text-foreground">{variable.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Operation</p>
                        <Badge variant="outline" className="text-xs">
                          {variable.operation.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Model</p>
                        <p className="text-sm text-foreground">{variable.model}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Column</p>
                        <p className="text-sm font-mono text-foreground">{variable.column}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )
    } else {
      const configData = ratingConfig.config_data as TaskRatingConfigData | StakeholderRatingConfigData
      return (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Rating Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {configData.fields.map((field, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{field.name}</p>
                    {field.description && (
                      <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-sm">
                    Max: {field.max_value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/rating-configs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Configurations
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-sans">{ratingConfig.name}</h1>
              <div className="flex items-center gap-2">
                <RatingConfigTypeBadge type={ratingConfig.type} />
                <Badge 
                  variant={ratingConfig.is_active ? 'default' : 'secondary'}
                  className={ratingConfig.is_active ? 'text-green-600 bg-green-100' : ''}
                >
                  {ratingConfig.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission('edit rating configs') && !ratingConfig.is_active && (
            <Button variant="outline" size="sm" onClick={handleActivate}>
              <Play className="mr-2 h-4 w-4" />
              Activate
            </Button>
          )}
          {hasPermission('edit rating configs') && (
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to={`/rating-configs/${ratingConfig.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Data */}
        <div className="lg:col-span-2">
          {ratingConfig.description && (
            <Card className="bg-card border-border mb-6">
              <CardHeader>
                <CardTitle className="text-foreground">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{ratingConfig.description}</p>
              </CardContent>
            </Card>
          )}
          
          {renderConfigData()}
        </div>

        {/* Metadata */}
        <div className="space-y-6">
          {/* Creator Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Creator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {ratingConfig.creator?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">
                    {ratingConfig.creator?.name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ratingConfig.creator?.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="text-foreground">
                  {new Date(ratingConfig.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Updated:</span>
                <span className="text-foreground">
                  {new Date(ratingConfig.updated_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <RatingConfigTypeBadge type={ratingConfig.type} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge 
                  variant={ratingConfig.is_active ? 'default' : 'secondary'}
                  className={ratingConfig.is_active ? 'text-green-600 bg-green-100' : ''}
                >
                  {ratingConfig.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {ratingConfig.type !== 'final_rating' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fields</span>
                  <Badge variant="outline">
                    {(ratingConfig.config_data as TaskRatingConfigData | StakeholderRatingConfigData).fields.length}
                  </Badge>
                </div>
              )}
              {ratingConfig.type === 'final_rating' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Variables</span>
                  <Badge variant="outline">
                    {(ratingConfig.config_data as FinalRatingConfigData).variables.length}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default RatingConfigDetailPage
