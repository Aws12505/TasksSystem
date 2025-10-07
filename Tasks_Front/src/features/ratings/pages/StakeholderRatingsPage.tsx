// pages/StakeholderRatingsPage.tsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useStakeholderRating } from '../hooks/useStakeholderRating'
import StakeholderRatingForm from '../components/StakeholderRatingForm'
import RatingDisplay from '../components/RatingDisplay'
import { Users, ArrowLeft } from 'lucide-react'

const StakeholderRatingsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const {
    stakeholderRatings,
    stakeholderRatingConfigs,
    pagination,
    isLoading,
    createRating,
    goToPage,
    nextPage,
    prevPage,
  } = useStakeholderRating(projectId!)

  const activeConfig = stakeholderRatingConfigs.find((config) => config.is_active)

  const handleCreateRating = async (data: any) => {
    await createRating(data)
  }

  const generatePaginationItems = () => {
    if (!pagination) return []
    const items: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
    const { current_page, last_page } = pagination

    if (current_page > 3) {
      items.push(1)
      if (current_page > 4) items.push('ellipsis-start')
    }
    for (let i = Math.max(1, current_page - 2); i <= Math.min(last_page, current_page + 2); i++) {
      items.push(i)
    }
    if (current_page < last_page - 2) {
      if (current_page < last_page - 3) items.push('ellipsis-end')
      items.push(last_page)
    }
    return items
  }

  if (!projectId) return <div>Project not found</div>

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Stakeholder Ratings</h1>
              <p className="text-muted-foreground">Project evaluation from stakeholder perspective</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/projects/${projectId}`} className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Project
              </Link>
            </Button>
          </div>
        </div>

        {/* Main grid (2-up cadence) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Rating Form */}
          <div>
            {isLoading ? (
              <div className="h-72 bg-muted animate-pulse rounded-lg" />
            ) : activeConfig ? (
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

          {/* Right: Existing Ratings + Pagination */}
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
              <>
                <div className="space-y-4">
                  {stakeholderRatings.map((rating) => (
                    <RatingDisplay key={rating.id} rating={rating} />
                  ))}
                </div>

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
                                className={
                                  pagination.current_page === 1
                                    ? 'pointer-events-none opacity-50'
                                    : 'cursor-pointer'
                                }
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
                                className={
                                  pagination.current_page === pagination.last_page
                                    ? 'pointer-events-none opacity-50'
                                    : 'cursor-pointer'
                                }
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
    </div>
  )
}

export default StakeholderRatingsPage
