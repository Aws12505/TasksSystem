import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTickets } from '../hooks/useTickets'
import { useFiltersStore } from '../../../stores/filtersStore'
import TicketsList from '../components/TicketsList'
import { Plus, Search, Ticket, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

const TicketsPage: React.FC = () => {
  const { 
    tickets, 
    availableTickets, 
    isLoading, 
    deleteTicket, 
    claimTicket,
    assignTicket,
    completeTicket,
    unassignTicket
  } = useTickets()
  const { searchQuery, setSearchQuery } = useFiltersStore()

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      await deleteTicket(id)
    }
  }

  const handleClaim = async (id: number) => {
    await claimTicket(id)
  }

  const handleAssign = async (id: number, userId: number) => {
    await assignTicket(id, userId)
  }

  const handleComplete = async (id: number) => {
    await completeTicket(id)
  }

  const handleUnassign = async (id: number) => {
    if (window.confirm('Are you sure you want to unassign this ticket?')) {
      await unassignTicket(id)
    }
  }

  // Calculate stats
  const openTickets = tickets.filter(t => t.status === 'open').length
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tickets..."
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
              Total Tickets
            </CardTitle>
            <Ticket className="w-4 h-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{tickets.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open
            </CardTitle>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{openTickets}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{inProgressTickets}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{resolvedTickets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="all">All Tickets ({tickets.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableTickets.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <TicketsList 
            tickets={tickets} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onClaim={handleClaim}
            onAssign={handleAssign}
            onComplete={handleComplete}
            onUnassign={handleUnassign}
          />
        </TabsContent>
        
        <TabsContent value="available">
          <TicketsList 
            tickets={availableTickets} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onClaim={handleClaim}
            onAssign={handleAssign}
            onComplete={handleComplete}
            onUnassign={handleUnassign}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TicketsPage
