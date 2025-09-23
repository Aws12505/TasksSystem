import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const HelpRequestsPage = lazy(() => import('@/features/help-requests/pages/index'))
const HelpRequestDetailPage = lazy(() => import('@/features/help-requests/pages/HelpRequestDetailPage'))
const HelpRequestEditPage = lazy(() => import('@/features/help-requests/pages/HelpRequestEditPage'))
const CreateHelpRequestPage = lazy(() => import('@/features/help-requests/pages/create'))


export const helpRequestsRoutes: RouteObject[] = [
  {
    path: '/help-requests',
    element: (
            <ProtectedRoute permission="view help requests">
      <HelpRequestsPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/help-requests/create',
    element: (
            <ProtectedRoute permission="create help requests">
      <CreateHelpRequestPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/help-requests/:id',
    element: (
            <ProtectedRoute permission="view help requests">
      <HelpRequestDetailPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/help-requests/:id/edit',
    element: (
            <ProtectedRoute permission="edit help requests">
      <HelpRequestEditPage />
            </ProtectedRoute>
    ),
  },
]
