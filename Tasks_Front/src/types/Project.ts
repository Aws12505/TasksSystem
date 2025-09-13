import type { User } from './User';

export type ProjectStatus = 'pending' | 'in_progress' | 'done' | 'rated';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  stakeholder_will_rate: boolean;
  stakeholder_id: number;
  stakeholder: User;
  status: ProjectStatus;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  stakeholder_will_rate?: boolean;
  // stakeholder_id is set automatically on backend
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  stakeholder_will_rate?: boolean;
  // stakeholder_id cannot be updated
}
