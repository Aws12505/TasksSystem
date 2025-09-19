import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const PublicCreateTicketPage = lazy(() => import('@/features/public/CreateTicketPage'))

export const publicRoutes: RouteObject[] = [
  {
    path: '/support-ticket',
    element: (
      <PublicCreateTicketPage />
    ),
  },
]
