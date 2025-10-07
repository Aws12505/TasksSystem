// pages/RatingConfigsPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRatingConfigs } from '../hooks/useRatingConfigs'
import { useFiltersStore } from '../../../stores/filtersStore'
import { usePermissions } from '@/hooks/usePermissions'
import RatingConfigsList from '../components/RatingConfigsList'
import { Plus, Search, Settings, CheckCircle2, Clock, Database } from 'lucide-react'

const RatingConfigsPage: React.FC = () => {
  const { 
    ratingConfigs, 
    pagination,
    isLoading, 
    deleteRatingConfig, 
    activateRatingConfig,
    fetchRatingConfigs,
    fetchRatingConfigsByType,
    goToPage,
    nextPage,
    prevPage
  } = useRatingConfigs()
  const { searchQuery, setSearchQuery } = useFiltersStore()
  const { hasPermission } = usePermissions()

  // Delete confirmation dialog state
  const [pendingDeleteId, setPendingDeleteId] = React.useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!hasPermission('delete rating configs')) return
    setPendingDeleteId(id) // open dialog
  }

  const confirmDelete = async () => {
    if (!hasPermission('delete rating configs')) {
      setPendingDeleteId(null)
      return
    }
    if (pendingDeleteId != null) {
      await deleteRatingConfig(pendingDeleteId)
      setPendingDeleteId(null)
    }
  }

  const handleActivate = async (id: number) => {
    if (!hasPermission('edit rating configs')) return
    await activateRatingConfig(id)
  }

  const handleTabChange = async (value: string) => {
    if (value === 'all') {
      await fetchRatingConfigs(1)
    } else {
      await fetchRatingConfigsByType(value, 1)
    }
  }

  // Page-local stats (based on current list)
  const activeConfigs = ratingConfigs.filter(c => c.is_active).length
  const taskRatingConfigs = ratingConfigs.filter(c => c.type === 'task_rating').length
  const stakeholderRatingConfigs = ratingConfigs.filter(c => c.type === 'stakeholder_rating').length

  // Pagination items
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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header (parity with TasksPage) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Rating Configurations</h1>
              <p className="text-muted-foreground">Manage rating system configurations</p>
            </div>
          </div>
          {hasPermission('create rating configs') && (
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/rating-configs/create">
                <Plus className="mr-2 h-4 w-4" />
                New Configuration
              </Link>
            </Button>
          )}
        </div>

        {/* Filters / Search (same grid & spacing rhythm) */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search configurations…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-input text-foreground"
                />
              </div>
              {/* reserved cells to keep layout parity with other pages */}
              <div className="hidden lg:block" />
              <div className="hidden lg:block" />
            </div>
          </CardContent>
        </Card>

        {/* Stats (same breakpoints as TasksPage) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Configurations
              </CardTitle>
              <Database className="w-4 h-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {pagination?.total || ratingConfigs.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
              <CheckCircle2 className="w-4 h-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{activeConfigs}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Task Rating
              </CardTitle>
              <Clock className="w-4 h-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{taskRatingConfigs}</div>
            </CardContent>
          </Card>

        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4" onValueChange={handleTabChange}>
          <TabsList className="bg-muted">
            <TabsTrigger value="all">All ({pagination?.total || ratingConfigs.length})</TabsTrigger>
            <TabsTrigger value="task_rating">Task Rating ({taskRatingConfigs})</TabsTrigger>
            <TabsTrigger value="stakeholder_rating">Stakeholder ({stakeholderRatingConfigs})</TabsTrigger>
          </TabsList>

          {/* All */}
          <TabsContent value="all" className="space-y-4">
            <Card className="bg-card border-border flex-1 flex flex-col min-h-0">
              <CardContent className="p-0">
                <RatingConfigsList 
                  ratingConfigs={ratingConfigs} 
                  isLoading={isLoading} 
                  onDelete={async (id) => { await handleDelete(id) }}
                  onActivate={async (id) => { await handleActivate(id) }}
                />
              </CardContent>
            </Card>

            {pagination && pagination.last_page > 1 && (
              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground text-center sm:text-left">
                      Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} results
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
          </TabsContent>

          {/* Task Rating */}
          <TabsContent value="task_rating" className="space-y-4">
            <Card className="bg-card border-border flex-1 flex flex-col min-h-0">
              <CardContent className="p-0">
                <RatingConfigsList 
                  ratingConfigs={ratingConfigs.filter(c => c.type === 'task_rating')} 
                  isLoading={isLoading} 
                  onDelete={async (id) => { await handleDelete(id) }}
                  onActivate={async (id) => { await handleActivate(id) }}
                />
              </CardContent>
            </Card>

            {pagination && pagination.last_page > 1 && (
              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground text-center sm:text-left">
                      Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} results
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
          </TabsContent>

          {/* Stakeholder Rating */}
          <TabsContent value="stakeholder_rating" className="space-y-4">
            <Card className="bg-card border-border flex-1 flex flex-col min-h-0">
              <CardContent className="p-0">
                <RatingConfigsList 
                  ratingConfigs={ratingConfigs.filter(c => c.type === 'stakeholder_rating')} 
                  isLoading={isLoading} 
                  onDelete={async (id) => { await handleDelete(id) }}
                  onActivate={async (id) => { await handleActivate(id) }}
                />
              </CardContent>
            </Card>

            {pagination && pagination.last_page > 1 && (
              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground text-center sm:text-left">
                      Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} results
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
          </TabsContent>


        </Tabs>
      </div>

      {/* Centered delete confirmation dialog (shadcn centers in the viewport by default) */}
      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this rating configuration? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default RatingConfigsPage
