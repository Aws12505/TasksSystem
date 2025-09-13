import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTicket } from '../hooks/useTicket'
import { useTickets } from '../hooks/useTickets'
import { useTicketsStore } from '../stores/ticketsStore'
import TicketForm from '../components/TicketForm'
import { ArrowLeft, Ticket } from 'lucide-react'

const TicketEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { ticket, availableUsers, isLoading, error } = useTicket(id!)
  const { updateTicket } = useTickets()
  const { getTypeOptions } = useTicketsStore()

  const handleUpdateTicket = async (data: any) => {
    if (!ticket) return
    const updatedTicket = await updateTicket(ticket.id, data)
    if (updatedTicket) {
      navigate(`/tickets/${ticket.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || 'Ticket not found'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/tickets/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ticket
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Edit Ticket</h1>
            <p className="text-muted-foreground">Update {ticket.title}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
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
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TicketEditPage
