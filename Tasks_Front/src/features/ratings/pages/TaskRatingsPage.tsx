// pages/TaskRatingsPage.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useTaskRating } from '../hooks/useTaskRating'
import TaskRatingForm from '../components/TaskRatingForm'
import RatingDisplay from '../components/RatingDisplay'
import { Star } from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { useRatingConfigs } from '@/features/rating-configs/hooks/useRatingConfigs'
import type { RatingConfig } from '../../../types/RatingConfig'

const TaskRatingsPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>()
  const { 
    taskRatings, 
    pagination,
    isLoading: isRatingsLoading, 
    createRating,
    goToPage,
    nextPage,
    prevPage
  } = useTaskRating(taskId!)

  // ── NEW: pull active "task_rating" configs from the store via the hook
  const {
    ratingConfigs,              // will hold whatever the store last fetched
    isLoading: isConfigsLoading,
    error: configsError,
    fetchActiveRatingConfigsByType
  } = useRatingConfigs()

  // Page-local state: which active config is selected for rating
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null)

  // On mount (and when taskId changes), load ACTIVE configs of type "task_rating"
  useEffect(() => {
    // We intentionally fetch ONLY active for this page
    fetchActiveRatingConfigsByType('task_rating').then(() => {
      // After store loads, preselect first active config if any
      // (ratingConfigs will reflect the latest fetch)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, fetchActiveRatingConfigsByType])

  // derive active configs (the store fills ratingConfigs with the last fetched set)
  const activeConfigs: RatingConfig[] = useMemo(() => ratingConfigs, [ratingConfigs])

  // ensure we have a selected config once activeConfigs arrive
  useEffect(() => {
    if (activeConfigs?.length) {
      setSelectedConfigId(prev => prev ?? activeConfigs[0].id)
    } else {
      setSelectedConfigId(null)
    }
  }, [activeConfigs])

  const activeConfig = useMemo(
    () => activeConfigs.find(c => c.id === selectedConfigId) ?? null,
    [activeConfigs, selectedConfigId]
  )

  const handleCreateRating = async (data: any) => {
    await createRating(data)
  }

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!pagination) return []

    const items = []
    const { current_page, last_page } = pagination
    
    if (current_page > 3) {
      items.push(1)
      if (current_page > 4) {
        items.push('ellipsis-start')
      }
    }

    for (let i = Math.max(1, current_page - 2); i <= Math.min(last_page, current_page + 2); i++) {
      items.push(i)
    }

    if (current_page < last_page - 2) {
      if (current_page < last_page - 3) {
        items.push('ellipsis-end')
      }
      items.push(last_page)
    }

    return items
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
        <div className="space-y-4">
          {/* NEW: Active Config chooser */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Active Config</p>
                  <p className="text-base font-medium truncate">
                    {activeConfig ? activeConfig.name : '—'}
                  </p>
                </div>
                <div className="w-64">
                  <Select
                    disabled={isConfigsLoading || activeConfigs.length === 0}
                    value={selectedConfigId?.toString() ?? undefined}
                    onValueChange={(v) => setSelectedConfigId(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={isConfigsLoading ? 'Loading configs...' : 'Choose config'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {activeConfigs.map(cfg => (
                        <SelectItem key={cfg.id} value={cfg.id.toString()}>
                          {cfg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {configsError && (
                <p className="mt-2 text-sm text-destructive">
                  {String(configsError)}
                </p>
              )}
            </CardContent>
          </Card>

          {isConfigsLoading ? (
            <div className="h-72 bg-muted animate-pulse rounded-lg" />
          ) : activeConfigs.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No active task rating configuration found
                </p>
              </CardContent>
            </Card>
          ) : activeConfig ? (
            <TaskRatingForm
              taskId={parseInt(taskId)}
              config={activeConfig}
              onSubmit={handleCreateRating}
              isLoading={isRatingsLoading}
            />
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Select a configuration to start rating</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Existing Ratings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Previous Ratings</h2>
          {isRatingsLoading ? (
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
            <>
              <div className="space-y-4">
                {taskRatings.map((rating) => (
                  <RatingDisplay key={rating.id} rating={rating} />
                ))}
              </div>

              {/* Task Ratings Pagination */}
              {pagination && pagination.last_page > 1 && (
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} results
                      </div>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={prevPage}
                              className={pagination.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          
                          {generatePaginationItems().map((item, index) => (
                            <PaginationItem key={index}>
                              {item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                                <PaginationEllipsis />
                              ) : (
                                <PaginationLink
                                  onClick={() => goToPage(item as number)}
                                  isActive={pagination.current_page === item}
                                  className="cursor-pointer"
                                >
                                  {item}
                                </PaginationLink>
                              )}
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={nextPage}
                              className={pagination.current_page === pagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskRatingsPage
