import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useHelpRequests } from '../hooks/useHelpRequests'
import { useFiltersStore } from '../../../stores/filtersStore'
import { usePermissions } from '@/hooks/usePermissions'
import HelpRequestsList from '../components/HelpRequestsList'
import { Plus, Search, HelpCircle, Clock, CheckCircle, Users } from 'lucide-react'

const HelpRequestsPage: React.FC = () => {
  const { 
    helpRequests, 
    availableHelpRequests, 
    isLoading, 
    deleteHelpRequest, 
    claimHelpRequest, 
    unclaimHelpRequest 
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
    // if (!hasPermission('claim help requests')) {
    //   return
    // }
    await claimHelpRequest(id)
  }

  const handleUnclaim = async (id: number) => {
    // if (!hasPermission('claim help requests')) {
    //   return
    // }
    
    if (window.confirm('Are you sure you want to unclaim this help request?')) {
      await unclaimHelpRequest(id)
    }
  }

  // Calculate stats
  const completedRequests = helpRequests.filter(r => r.is_completed).length
  const inProgressRequests = helpRequests.filter(r => r.is_claimed && !r.is_completed).length

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
            <div className="text-2xl font-bold text-foreground">{helpRequests.length}</div>
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
            <div className="text-2xl font-bold text-foreground">{availableHelpRequests.length}</div>
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
          <TabsTrigger value="all">All Requests ({helpRequests.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableHelpRequests.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <HelpRequestsList 
            helpRequests={helpRequests} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onClaim={handleClaim}
            onUnclaim={handleUnclaim}
          />
        </TabsContent>
        
        <TabsContent value="available">
          <HelpRequestsList 
            helpRequests={availableHelpRequests} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onClaim={handleClaim}
            onUnclaim={handleUnclaim}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default HelpRequestsPage
