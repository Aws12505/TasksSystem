import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const ProjectsPage = lazy(() => import('@/features/projects/pages/index'))
const ProjectDetailPage = lazy(() => import('@/features/projects/pages/ProjectDetailPage'))
const ProjectEditPage = lazy(() => import('@/features/projects/pages/ProjectEditPage'))
const CreateProjectPage = lazy(() => import('@/features/projects/pages/create'))
const KanbanPage = lazy(() => import('@/features/kanban/pages/KanbanPage'))

export const projectsRoutes: RouteObject[] = [
  {
    path: '/projects',
    element: (
      <ProjectsPage />
    ),
  },
  {
    path: '/projects/create',
    element: (
      <CreateProjectPage />
    ),
  },
  {
    path: '/projects/:id',
    element: (
      <ProjectDetailPage />
    ),
  },
  {
    path: '/projects/:id/edit',
    element: (
      <ProjectEditPage />
    ),
  },
  {
    path: '/projects/:id/kanban',
    element: (
      <KanbanPage />
    ),
  }
]
