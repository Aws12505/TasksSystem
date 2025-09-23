import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoute'

const ProjectsPage = lazy(() => import('@/features/projects/pages/index'))
const ProjectDetailPage = lazy(() => import('@/features/projects/pages/ProjectDetailPage'))
const ProjectEditPage = lazy(() => import('@/features/projects/pages/ProjectEditPage'))
const CreateProjectPage = lazy(() => import('@/features/projects/pages/create'))
const KanbanPage = lazy(() => import('@/features/kanban/pages/KanbanPage'))

export const projectsRoutes: RouteObject[] = [
  {
    path: '/projects',
    element: (
            <ProtectedRoute permission="view projects">
      <ProjectsPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/projects/create',
    element: (
            <ProtectedRoute permission="create projects">
      <CreateProjectPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/projects/:id',
    element: (
            <ProtectedRoute permission="view projects">
      <ProjectDetailPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/projects/:id/edit',
    element: (
            <ProtectedRoute permission="edit projects">
      <ProjectEditPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/projects/:id/kanban',
    element: (
            <ProtectedRoute permission="view projects">
      <KanbanPage />
            </ProtectedRoute>
    ),
  }
]
