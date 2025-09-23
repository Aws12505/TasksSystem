import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTicketsStore } from '../stores/ticketsStore'
import TicketForm from '../components/TicketForm'
import { ArrowLeft, Ticket } from 'lucide-react'
import { useAuthStore } from '@/features/auth/stores/authStore'

const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  
  const { 
    availableUsers, 
    isLoading, 
    createTicket, 
    fetchAvailableUsers,
    getTypeOptions
  } = useTicketsStore()

  React.useEffect(() => {
    fetchAvailableUsers()
  }, [fetchAvailableUsers])

  const handleCreateTicket = async (data: any) => {
    const ticket = await createTicket(data)
    if (ticket) {
      navigate(`/tickets/${ticket.id}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/tickets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tickets
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Create Ticket</h1>
            <p className="text-muted-foreground">Submit a new support ticket</p>
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
              availableUsers={availableUsers}
              typeOptions={getTypeOptions()}
              onSubmit={handleCreateTicket}
              isLoading={isLoading}
              isAuthenticated={isAuthenticated}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateTicketPage
