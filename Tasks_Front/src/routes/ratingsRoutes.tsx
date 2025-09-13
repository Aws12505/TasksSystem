import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const RatingsPage = lazy(() => import('@/features/ratings/pages/index'))
const TaskRatingsPage = lazy(() => import('@/features/ratings/pages/TaskRatingsPage'))
const StakeholderRatingsPage = lazy(() => import('@/features/ratings/pages/StakeholderRatingsPage'))

export const ratingsRoutes: RouteObject[] = [
  {
    path: '/ratings/tasks/:taskId',
    element: (
      <TaskRatingsPage />
    ),
  },
  {
    path: '/ratings',
    element: (
      <RatingsPage />
    ),
  },
  {
    path: '/ratings/projects/:projectId/stakeholder',
    element: (
      <StakeholderRatingsPage />
    ),
  },
]
