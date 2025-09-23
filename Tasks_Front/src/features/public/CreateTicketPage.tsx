import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTicketsStore } from '@/features/tickets/stores/ticketsStore'
import TicketForm from '@/features/tickets/components/TicketForm'
import { useAuthStore } from '@/features/auth/stores/authStore' // Add this import

/**
 * PublicCreateTicketPage
 * - no app layout / chrome
 * - centered, single-page experience
 * - shows /logo.svg from public at the top
 * - reuses the SAME TicketForm (unchanged)
 */
const PublicCreateTicketPage: React.FC = () => {
  const navigate = useNavigate()

  const {
    isLoading,
    createTicket,
    getTypeOptions,
  } = useTicketsStore()

  const { isAuthenticated } = useAuthStore() // Add this line



  const handleCreateTicket = async (data: any) => {
    const ticket = await createTicket(data)
    if (ticket) {
      // Navigate to success page instead
      navigate('/support-ticket/success')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 py-10">
        {/* Top Logo */}
        <img
          src="/logo.svg"
          alt="Logo"
          className="mb-8 h-20 w-auto opacity-90 md:h-28"
        />

        {/* Page heading */}
        <div className="mb-6 text-center">
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            Submit a Support Ticket
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us what’s going on and we’ll get right on it.
          </p>
        </div>

        {/* Form surface (no dashboard layout, just a tasteful panel) */}
        <div className="w-full rounded-xl border border-border bg-card/95 p-6 shadow-sm backdrop-blur md:p-8">
          <TicketForm
            typeOptions={getTypeOptions()}
            onSubmit={handleCreateTicket}
            isLoading={isLoading}
            isAuthenticated={isAuthenticated} // Add this prop
          />
        </div>

        
      </div>
    </div>
  )
}

export default PublicCreateTicketPage
