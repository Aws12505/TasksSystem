// pages/HelpRequestsPage.tsx
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
import { useHelpRequests } from '../hooks/useHelpRequests'
import { useFiltersStore } from '../../../stores/filtersStore'
import { usePermissions } from '@/hooks/usePermissions'
import HelpRequestsList from '../components/HelpRequestsList'
import { Plus, Search, HelpCircle, Clock, CheckCircle, Users } from 'lucide-react'

const HelpRequestsPage: React.FC = () => {
  const { 
    helpRequests, 
    availableHelpRequests, 
    pagination,
    availablePagination,
    isLoading, 
    deleteHelpRequest, 
    claimHelpRequest, 
    unclaimHelpRequest,
    goToPage,
    goToAvailablePage,
    nextPage,
    prevPage,
    nextAvailablePage,
    prevAvailablePage
  } = useHelpRequests()

  const { searchQuery, setSearchQuery } = useFiltersStore()
  const { hasPermission } = usePermissions()

  // Dialog states
  const [requestToDelete, setRequestToDelete] = React.useState<number | null>(null)
  const [requestToUnclaim, setRequestToUnclaim] = React.useState<number | null>(null)

  // Handlers (open dialogs instead of window.confirm)
  const handleDelete = async (id: number) => {
    if (!hasPermission('delete help requests')) return
    setRequestToDelete(id)
  }

  const confirmDelete = async () => {
    if (requestToDelete != null) {
      await deleteHelpRequest(requestToDelete)
      setRequestToDelete(null)
    }
  }

  const handleClaim = async (id: number) => {
    await claimHelpRequest(id)
  }

  const handleUnclaim = async (id: number) => {
    setRequestToUnclaim(id)
  }

  const confirmUnclaim = async () => {
    if (requestToUnclaim != null) {
      await unclaimHelpRequest(requestToUnclaim)
      setRequestToUnclaim(null)
    }
  }

  // Page-local stats
  const completedRequests = helpRequests.filter(r => r.is_completed).length
  const inProgressRequests = helpRequests.filter(r => r.is_claimed && !r.is_completed).length

  // Pagination items
  const generatePaginationItems = (paginationInfo: typeof pagination) => {
    if (!paginationInfo) return []
    const items: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
    const { current_page, last_page } = paginationInfo
    
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
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Help Requests</h1>
              <p className="text-muted-foreground">Manage support requests and provide assistance</p>
            </div>
          </div>
          {hasPermission('create help requests') && (
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/help-requests/create">
                <Plus className="mr-2 h-4 w-4" />
                Request Help
              </Link>
            </Button>
          )}
        </div>

        {/* Search (same grid/spacing rhythm) */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search help requests…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-input text-foreground"
                />
              </div>
              {/* reserved slots for future filters to keep parity */}
              <div className="hidden lg:block" />
              <div className="hidden lg:block" />
            </div>
          </CardContent>
        </Card>

        {/* Stats (same breakpoints as TasksPage) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
              <HelpCircle className="w-4 h-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {pagination?.total || helpRequests.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
              <Clock className="w-4 h-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {availablePagination?.total || availableHelpRequests.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress (page)</CardTitle>
              <Users className="w-4 h-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{inProgressRequests}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed (page)</CardTitle>
              <CheckCircle className="w-4 h-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{completedRequests}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="all">
              All Requests ({pagination?.total || helpRequests.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Available ({availablePagination?.total || availableHelpRequests.length})
            </TabsTrigger>
          </TabsList>
          
          {/* All Requests */}
          <TabsContent value="all" className="space-y-4">
            <Card className="bg-card border-border flex-1 flex flex-col min-h-0">
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-hidden">
                  <HelpRequestsList 
                    helpRequests={helpRequests} 
                    isLoading={isLoading} 
                    onDelete={handleDelete}
                    onClaim={handleClaim}
                    onUnclaim={handleUnclaim}
                  />
                </div>
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
                        
                        {generatePaginationItems(pagination).map((item, index) => (
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

          {/* Available Requests */}
          <TabsContent value="available" className="space-y-4">
            <Card className="bg-card border-border flex-1 flex flex-col min-h-0">
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-hidden">
                  <HelpRequestsList 
                    helpRequests={availableHelpRequests} 
                    isLoading={isLoading} 
                    onDelete={handleDelete}
                    onClaim={handleClaim}
                    onUnclaim={handleUnclaim}
                  />
                </div>
              </CardContent>
            </Card>

            {availablePagination && availablePagination.last_page > 1 && (
              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground text-center sm:text-left">
                      Showing {availablePagination.from || 0} to {availablePagination.to || 0} of {availablePagination.total || 0} results
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={prevAvailablePage}
                            className={availablePagination.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {generatePaginationItems(availablePagination).map((item, index) => (
                          <PaginationItem key={index}>
                            {item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                onClick={() => goToAvailablePage(item as number)}
                                isActive={availablePagination.current_page === item}
                                className="cursor-pointer"
                              >
                                {item}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={nextAvailablePage}
                            className={availablePagination.current_page === availablePagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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

      {/* Delete Help Request Dialog (centered) */}
      <AlertDialog
        open={requestToDelete !== null}
        onOpenChange={(open) => !open && setRequestToDelete(null)}
      >
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete help request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this help request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRequestToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unclaim Help Request Dialog (centered) */}
      <AlertDialog
        open={requestToUnclaim !== null}
        onOpenChange={(open) => !open && setRequestToUnclaim(null)}
      >
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Unclaim help request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unclaim this help request? It will become available for others to claim.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRequestToUnclaim(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnclaim}>
              Unclaim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default HelpRequestsPage
