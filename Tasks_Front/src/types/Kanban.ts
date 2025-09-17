// types/Kanban.ts
import type { Project } from './Project';
import type { Section } from './Section';
import type { Task, TaskStatus } from './Task';

export interface KanbanSection {
  section: Section;
  tasks_by_status: TasksByStatus;
}

export interface TasksByStatus {
  pending: Task[];
  in_progress: Task[];
  done: Task[];
  rated: Task[];
}

export interface KanbanBoard {
  project: Project;
  sections: KanbanSection[];
}

export interface MoveTaskToSectionRequest {
  section_id: number;
}

export interface MoveTaskStatusRequest {
  status: TaskStatus;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface KanbanDragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
}
