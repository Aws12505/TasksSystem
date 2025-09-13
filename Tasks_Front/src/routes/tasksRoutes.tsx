import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const TasksPage = lazy(() => import('@/features/tasks/pages/index'))
const TaskDetailPage = lazy(() => import('@/features/tasks/pages/TaskDetailPage'))
const TaskEditPage = lazy(() => import('@/features/tasks/pages/TaskEditPage'))
const CreateTaskPage = lazy(() => import('@/features/tasks/pages/create'))



export const tasksRoutes: RouteObject[] = [
  {
    path: '/tasks',
    element: (
      <TasksPage />
    ),
  },
  {
    path: '/tasks/create',
    element: (
      <CreateTaskPage />
    ),
  },
  {
    path: '/tasks/:id',
    element: (
      <TaskDetailPage />
    ),
  },
  {
    path: '/tasks/:id/edit',
    element: (
      <TaskEditPage />
    ),
  },
]
