import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const TasksPage = lazy(() => import('@/features/tasks/pages/index'))
const TaskDetailPage = lazy(() => import('@/features/tasks/pages/TaskDetailPage'))
const TaskEditPage = lazy(() => import('@/features/tasks/pages/TaskEditPage'))
const CreateTaskPage = lazy(() => import('@/features/tasks/pages/create'))



export const tasksRoutes: RouteObject[] = [
  {
    path: '/tasks',
    element: (
            <ProtectedRoute permission="view tasks">
      <TasksPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/tasks/create',
    element: (
            <ProtectedRoute permission="create tasks">
      <CreateTaskPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/tasks/:id',
    element: (
            <ProtectedRoute permission="view tasks">
      <TaskDetailPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/tasks/:id/edit',
    element: (
            <ProtectedRoute permission="edit tasks">
      <TaskEditPage />
            </ProtectedRoute>
    ),
  },
]
