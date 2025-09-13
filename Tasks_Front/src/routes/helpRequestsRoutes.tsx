import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const HelpRequestsPage = lazy(() => import('@/features/help-requests/pages/index'))
const HelpRequestDetailPage = lazy(() => import('@/features/help-requests/pages/HelpRequestDetailPage'))
const HelpRequestEditPage = lazy(() => import('@/features/help-requests/pages/HelpRequestEditPage'))
const CreateHelpRequestPage = lazy(() => import('@/features/help-requests/pages/create'))


export const helpRequestsRoutes: RouteObject[] = [
  {
    path: '/help-requests',
    element: (
      <HelpRequestsPage />
    ),
  },
  {
    path: '/help-requests/create',
    element: (
      <CreateHelpRequestPage />
    ),
  },
  {
    path: '/help-requests/:id',
    element: (
      <HelpRequestDetailPage />
    ),
  },
  {
    path: '/help-requests/:id/edit',
    element: (
      <HelpRequestEditPage />
    ),
  },
]
