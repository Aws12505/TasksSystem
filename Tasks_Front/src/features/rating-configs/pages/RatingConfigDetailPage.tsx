// pages/RatingConfigDetailPage.tsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useRatingConfig } from '../hooks/useRatingConfig'
import { usePermissions } from '@/hooks/usePermissions'
import RatingConfigTypeBadge from '../components/RatingConfigTypeBadge'
import { Edit, ArrowLeft, Settings, Calendar, User as UserIcon, Play } from 'lucide-react'
import type {
  TaskRatingConfigData,
  StakeholderRatingConfigData,
} from '../../../types/RatingConfig'

const RatingConfigDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { ratingConfig, isLoading, error, activateConfig } = useRatingConfig(id!)
  const { hasPermission } = usePermissions()

  // New: activation confirmation dialog state
  const [activateOpen, setActivateOpen] = React.useState(false)

  const handleActivate = async () => {
    if (!hasPermission('edit rating configs')) return
    setActivateOpen(true) // open dialog instead of window.confirm
  }

  const confirmActivate = async () => {
    if (!hasPermission('edit rating configs')) {
      setActivateOpen(false)
      return
    }
    await activateConfig()
    setActivateOpen(false)
  }

  const renderConfigData = () => {
    if (!ratingConfig) return null



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

  // Loading (keep page shell + header cadence)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="h-8 bg-muted animate-pulse rounded w-48" />
                <div className="h-4 bg-muted animate-pulse rounded w-64 mt-2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Configurations
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border lg:col-span-2">
              <CardContent className="p-6">
                <div className="h-40 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="h-14 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="h-24 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="h-24 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error (carded, same shell)
  if (error || !ratingConfig) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-destructive">{error || 'Rating configuration not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">
                {ratingConfig.name}
              </h1>
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
          <div className="flex items-center gap-2">
            {hasPermission('edit rating configs') && !ratingConfig.is_active && (
              <Button variant="outline" size="sm" onClick={handleActivate}>
                <Play className="mr-2 h-4 w-4" />
                Activate
              </Button>
            )}
            {hasPermission('edit rating configs') && (
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                <Link to={`/rating-configs/${ratingConfig.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/rating-configs" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Configurations
              </Link>
            </Button>
          </div>
        </div>

        {/* Content Grid (2/1 split like other detail pages) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: description + config data */}
          <div className="lg:col-span-2 space-y-6">
            {ratingConfig.description && (
              <Card className="bg-card border-border">
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

          {/* Right: metadata */}
          <div className="space-y-6">
            {/* Creator */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Creator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    {typeof ratingConfig.creator.avatar_url === 'string' && ratingConfig.creator.avatar_url.trim() !== '' && (
              <AvatarImage
              src={ratingConfig.creator.avatar_url}
              alt={ratingConfig.creator.name || 'User avatar'}
              className="object-cover"
              />
              )}
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

            {/* Summary */}
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

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fields</span>
                    <Badge variant="outline">
                      {(ratingConfig.config_data as TaskRatingConfigData | StakeholderRatingConfigData).fields.length}
                    </Badge>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Centered activation confirmation dialog (shadcn centers in viewport by default) */}
      <AlertDialog open={activateOpen} onOpenChange={(open) => !open && setActivateOpen(false)}>
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Activate configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate this rating configuration? This may affect how ratings are calculated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActivateOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmActivate}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default RatingConfigDetailPage
