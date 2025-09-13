import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const AnalyticsPage = lazy(() => import('@/features/analytics/pages/index'))
const UserAnalyticsPage = lazy(() => import('@/features/analytics/pages/UserAnalyticsPage'))
const ProjectAnalyticsPage = lazy(() => import('@/features/analytics/pages/ProjectAnalyticsPage'))

export const analyticsRoutes: RouteObject[] = [
  {
    path: '/analytics',
    element: (
      <AnalyticsPage />
    ),
  },
  {
    path: '/analytics/users/:userId',
    element: (
      <UserAnalyticsPage />
    ),
  },
  {
    path: '/analytics/projects/:projectId',
    element: (
      <ProjectAnalyticsPage />
    ),
  },
]
