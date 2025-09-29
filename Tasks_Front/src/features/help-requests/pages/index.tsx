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

  const handleDelete = async (id: number) => {
    if (!hasPermission('delete help requests')) {
      return
    }
    
    if (window.confirm('Are you sure you want to delete this help request?')) {
      await deleteHelpRequest(id)
    }
  }

  const handleClaim = async (id: number) => {
    await claimHelpRequest(id)
  }

  const handleUnclaim = async (id: number) => {
    if (window.confirm('Are you sure you want to unclaim this help request?')) {
      await unclaimHelpRequest(id)
    }
  }

  // Calculate stats from current page data
  const completedRequests = helpRequests.filter(r => r.is_completed).length
  const inProgressRequests = helpRequests.filter(r => r.is_claimed && !r.is_completed).length

  // Generate pagination items for main pagination
  const generatePaginationItems = (paginationInfo: typeof pagination) => {
    if (!paginationInfo) return []

    const items = []
    const { current_page, last_page } = paginationInfo
    
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

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search help requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-input text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
            <HelpCircle className="w-4 h-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {pagination?.total || helpRequests.length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available
            </CardTitle>
            <Clock className="w-4 h-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {availablePagination?.total || availableHelpRequests.length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Users className="w-4 h-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{inProgressRequests}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
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
        
        <TabsContent value="all" className="space-y-4">
          <HelpRequestsList 
            helpRequests={helpRequests} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onClaim={handleClaim}
            onUnclaim={handleUnclaim}
          />
          
          {/* All Requests Pagination */}
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
        
        <TabsContent value="available" className="space-y-4">
          <HelpRequestsList 
            helpRequests={availableHelpRequests} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onClaim={handleClaim}
            onUnclaim={handleUnclaim}
          />
          
          {/* Available Requests Pagination */}
          {availablePagination && availablePagination.last_page > 1 && (
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {availablePagination.from || 0} to {availablePagination.to || 0} of {availablePagination.total} results
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
  )
}

export default HelpRequestsPage
