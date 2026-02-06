// pages/CreateTicketPage.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTicketsStore } from "../stores/ticketsStore";
import TicketForm from "../components/TicketForm";
import { ArrowLeft, Ticket as TicketIcon } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";

const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const {
    availableUsers,
    isLoading,
    createTicket,
    fetchAvailableUsers,
    getTypeOptions,
  } = useTicketsStore();

  React.useEffect(() => {
    fetchAvailableUsers();
  }, [fetchAvailableUsers]);

  const handleCreateTicket = async (data: any) => {
    const ticket = await createTicket(data);
    if (ticket) navigate(`/tickets/${ticket.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TicketIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">
                Create Ticket
              </h1>
              <p className="text-muted-foreground">
                Submit a new support ticket
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild disabled={isLoading}>
              <Link to="/tickets" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tickets
              </Link>
            </Button>
          </div>
        </div>

        {/* Form card */}
        <div className="max-w-2xl">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Ticket Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-24 bg-muted animate-pulse rounded" />
                  <div className="flex gap-2">
                    <div className="h-10 bg-muted animate-pulse rounded w-32" />
                    <div className="h-10 bg-muted animate-pulse rounded w-24" />
                  </div>
                </div>
              ) : (
                <TicketForm
                  availableUsers={availableUsers}
                  typeOptions={getTypeOptions()}
                  onSubmit={handleCreateTicket}
                  isLoading={isLoading}
                  isAuthenticated={isAuthenticated}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketPage;
