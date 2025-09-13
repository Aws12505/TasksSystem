// types/Section.ts
import type { Project } from './Project';

export interface Section {
  id: number;
  name: string;
  description: string | null;
  project_id: number;
  project: Project;
  created_at: string;
  updated_at: string;
}

export interface CreateSectionRequest {
  name: string;
  description?: string;
  project_id: number;
}

export interface UpdateSectionRequest {
  name?: string;
  description?: string;
  project_id?: number;
}
