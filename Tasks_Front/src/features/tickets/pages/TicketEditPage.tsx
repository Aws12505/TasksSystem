import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTicket } from '../hooks/useTicket'
import { useTickets } from '../hooks/useTickets'
import { useTicketsStore } from '../stores/ticketsStore'
import TicketForm from '../components/TicketForm'
import { ArrowLeft, Ticket } from 'lucide-react'
import { useAuthStore } from '@/features/auth/stores/authStore'

const TicketEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { ticket, availableUsers, isLoading, error } = useTicket(id!)
  const { updateTicket } = useTickets()
  const { getTypeOptions } = useTicketsStore()
  const { isAuthenticated } = useAuthStore()

  const handleUpdateTicket = async (data: any) => {
    if (!ticket) return
    const updatedTicket = await updateTicket(ticket.id, data)
    if (updatedTicket) {
      navigate(`/tickets/${ticket.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Ticket className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="h-8 bg-muted animate-pulse rounded w-48" />
                <div className="h-4 bg-muted animate-pulse rounded w-64 mt-2" />
              </div>
            </div>
            <div className="h-9 bg-muted animate-pulse rounded w-36" />
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted animate-pulse rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <div className="text-center py-12">
            <p className="text-destructive">{error || 'Ticket not found'}</p>
          </div>
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
              <Ticket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Edit Ticket</h1>
              <p className="text-muted-foreground">Update {ticket.title}</p>
            </div>
          </div>

          {/* Right-side action (Back button) */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/tickets/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Ticket
              </Link>
            </Button>
          </div>
        </div>

        {/* Form card (no width cap, consistent cadence) */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Ticket Information</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketForm
              ticket={ticket}
              availableUsers={availableUsers}
              typeOptions={getTypeOptions()}
              onSubmit={handleUpdateTicket}
              isLoading={false}
              isAuthenticated={isAuthenticated}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TicketEditPage
