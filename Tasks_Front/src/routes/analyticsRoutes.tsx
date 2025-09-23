import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoute'

const AnalyticsPage = lazy(() => import('@/features/analytics/pages/index'))
const UserAnalyticsPage = lazy(() => import('@/features/analytics/pages/UserAnalyticsPage'))
const ProjectAnalyticsPage = lazy(() => import('@/features/analytics/pages/ProjectAnalyticsPage'))

export const analyticsRoutes: RouteObject[] = [
  {
    path: '/analytics',
    element: (
            <ProtectedRoute permission="view analytics">
      <AnalyticsPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/analytics/users/:userId',
    element: (
            <ProtectedRoute permission="view analytics">
      <UserAnalyticsPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/analytics/projects/:projectId',
    element: (
            <ProtectedRoute permission="view analytics">
      <ProjectAnalyticsPage />
            </ProtectedRoute>
    ),
  },
]
