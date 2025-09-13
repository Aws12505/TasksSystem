// types/Ticket.ts
import type { User } from './User';
import type { Priority } from './Task';

export type TicketStatus = 'open' | 'in_progress' | 'resolved';
export type TicketType = 'quick_fix' | 'bug_investigation' | 'user_support';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  type: TicketType;
  priority: Priority;
  requester_id: number;
  requester: User;
  assigned_to: number | null;
  assignee: User | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  is_assigned: boolean;
  is_available: boolean;
  is_completed: boolean;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  type: TicketType;
  priority: Priority;
  assigned_to?: number; // For direct assignment
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  type?: TicketType;
  priority?: Priority;
  status?: TicketStatus;
  assigned_to?: number;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

export interface TicketStatusOption {
  value: TicketStatus;
  label: string;
  color: string;
}

export interface TicketTypeOption {
  value: TicketType;
  label: string;
  estimatedTime: string;
}
