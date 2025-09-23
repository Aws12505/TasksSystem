import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const RatingsPage = lazy(() => import('@/features/ratings/pages/index'))
const TaskRatingsPage = lazy(() => import('@/features/ratings/pages/TaskRatingsPage'))
const StakeholderRatingsPage = lazy(() => import('@/features/ratings/pages/StakeholderRatingsPage'))

export const ratingsRoutes: RouteObject[] = [
  {
    path: '/ratings/tasks/:taskId',
    element: (
            <ProtectedRoute permissions={['create task ratings', 'view tasks']} requireAll={true}>
      <TaskRatingsPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/ratings',
    element: (
            <ProtectedRoute permissions={['view final ratings', 'create task ratings', 'create stakeholder ratings']} requireAll={false}>
      <RatingsPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/ratings/projects/:projectId/stakeholder',
    element: (
            <ProtectedRoute permissions={['create stakeholder ratings', 'view projects']} requireAll={true}>
      <StakeholderRatingsPage />
            </ProtectedRoute>
    ),
  },
]
