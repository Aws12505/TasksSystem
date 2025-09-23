import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CheckCircle2, PlusCircle } from 'lucide-react'

const TicketSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 py-10">
        {/* Top Logo */}
        <img
          src="/logo.svg"
          alt="Logo"
          className="mb-8 h-20 w-auto opacity-90 md:h-28"
        />

        {/* Success Message */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-3">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            Ticket Submitted Successfully!
          </h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            Thank you for submitting your ticket. Our team will review it and get back to you as soon as possible.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild variant="default">
            <Link to="/support-ticket">
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit Another Ticket
            </Link>
          </Button>
        </div>

        {/* Reference Number */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need to submit another request?</p>
          <p>You can always come back to this page to create a new ticket.</p>
        </div>
      </div>
    </div>
  )
}

export default TicketSuccessPage