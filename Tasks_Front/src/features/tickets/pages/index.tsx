// pages/TicketsPage.tsx
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
import { useTickets } from '../hooks/useTickets'
import { useFiltersStore } from '../../../stores/filtersStore'
import { usePermissions } from '@/hooks/usePermissions'
import TicketsList from '../components/TicketsList'
import { Plus, Search, Ticket, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

const TicketsPage: React.FC = () => {
  const { 
    tickets, 
    availableTickets, 
    pagination,
    availablePagination,
    isLoading, 
    deleteTicket, 
    claimTicket,
    assignTicket,
    completeTicket,
    unassignTicket,
    goToPage,
    goToAvailablePage,
    nextPage,
    prevPage,
    nextAvailablePage,
    prevAvailablePage
  } = useTickets()

  const { searchQuery, setSearchQuery } = useFiltersStore()
  const { hasPermission } = usePermissions()

  // Centralized confirm dialog state for destructive actions
  const [pendingAction, setPendingAction] = React.useState<null | { type: 'delete' | 'unassign'; id: number }>(null)

  // Open the confirm dialog for delete
  const handleDelete = async (id: number) => {
    if (!hasPermission('delete tickets')) return
    setPendingAction({ type: 'delete', id })
  }

  // Keep the other actions unchanged (no confirm needed)
  const handleClaim = async (id: number) => {
    await claimTicket(id)
  }

  const handleAssign = async (id: number, userId: number) => {
    await assignTicket(id, userId)
  }

  const handleComplete = async (id: number) => {
    await completeTicket(id)
  }

  // Open the confirm dialog for unassign
  const handleUnassign = async (id: number) => {
    setPendingAction({ type: 'unassign', id })
  }

  // Confirm whichever action is pending
  const confirmPendingAction = async () => {
    if (!pendingAction) return
    if (pendingAction.type === 'delete') {
      if (!hasPermission('delete tickets')) {
        setPendingAction(null)
        return
      }
      await deleteTicket(pendingAction.id)
    } else if (pendingAction.type === 'unassign') {
      if (!hasPermission('edit tickets')) {
        setPendingAction(null)
        return
      }
      await unassignTicket(pendingAction.id)
    }
    setPendingAction(null)
  }

  // Page-local stats
  const openTickets = tickets.filter(t => t.status === 'open').length
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length

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

  // Dialog copy
  const dialogTitle =
    pendingAction?.type === 'delete' ? 'Delete ticket' :
    pendingAction?.type === 'unassign' ? 'Unassign ticket' :
    ''
  const dialogDescription =
    pendingAction?.type === 'delete'
      ? 'Are you sure you want to delete this ticket? This action cannot be undone.'
      : pendingAction?.type === 'unassign'
      ? 'Are you sure you want to unassign this ticket? It will become available for others to claim.'
      : ''
  const confirmLabel =
    pendingAction?.type === 'delete' ? 'Delete' :
    pendingAction?.type === 'unassign' ? 'Unassign' :
    'Confirm'
  const confirmClass =
    pendingAction?.type === 'delete'
      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
      : 'bg-primary text-primary-foreground hover:bg-primary/90'

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header (parity with TasksPage) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Ticket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Tickets</h1>
              <p className="text-muted-foreground">Manage support tickets and track resolution</p>
            </div>
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/tickets/create">
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Link>
          </Button>
        </div>

        {/* Filters (search) — same spacing/grid pattern */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tickets (subject, requester, ID)…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-input text-foreground"
                />
              </div>
              {/* reserved slots to keep grid parity for future filters */}
              <div className="hidden lg:block" />
              <div className="hidden lg:block" />
            </div>
          </CardContent>
        </Card>

        {/* Stats (same grid breakpoints) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total (filtered/page)</CardTitle>
              <Ticket className="w-4 h-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {pagination?.total || tickets.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open (page)</CardTitle>
              <AlertCircle className="w-4 h-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{openTickets}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress (page)</CardTitle>
              <Clock className="w-4 h-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{inProgressTickets}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resolved (page)</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{resolvedTickets}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="all">All Tickets ({pagination?.total || tickets.length})</TabsTrigger>
            <TabsTrigger value="available">Available ({availablePagination?.total || availableTickets.length})</TabsTrigger>
          </TabsList>

          {/* All Tickets */}
          <TabsContent value="all" className="space-y-4">
            {/* List container inside Card (parity with TasksPage) */}
            <Card className="bg-card border-border flex-1 flex flex-col min-h-0">
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-hidden">
                  <TicketsList 
                    tickets={tickets} 
                    isLoading={isLoading} 
                    onDelete={async (id) => { await handleDelete(id) }}
                    onClaim={async (id) => { await handleClaim(id) }}
                    onAssign={async (id, userId) => { await handleAssign(id, userId) }}
                    onComplete={async (id) => { await handleComplete(id) }}
                    onUnassign={async (id) => { await handleUnassign(id) }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pagination (responsive like TasksPage) */}
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

          {/* Available Tickets */}
          <TabsContent value="available" className="space-y-4">
            <Card className="bg-card border-border flex-1 flex flex-col min-h-0">
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-hidden">
                  <TicketsList 
                    tickets={availableTickets} 
                    isLoading={isLoading} 
                    onDelete={async (id) => { await handleDelete(id) }}
                    onClaim={async (id) => { await handleClaim(id) }}
                    onAssign={async (id, userId) => { await handleAssign(id, userId) }}
                    onComplete={async (id) => { await handleComplete(id) }}
                    onUnassign={async (id) => { await handleUnassign(id) }}
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

      {/* Centered confirmation dialog (shadcn centers in the viewport by default) */}
      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPendingAction} className={confirmClass}>
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default TicketsPage
