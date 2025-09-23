import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const TicketsPage = lazy(() => import('@/features/tickets/pages/index'))
const TicketDetailPage = lazy(() => import('@/features/tickets/pages/TicketDetailPage'))
const TicketEditPage = lazy(() => import('@/features/tickets/pages/TicketEditPage'))
const CreateTicketPage = lazy(() => import('@/features/tickets/pages/create'))



export const ticketsRoutes: RouteObject[] = [
  {
    path: '/tickets',
    element: (
            <ProtectedRoute permission="view tickets">
      <TicketsPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/tickets/create',
    element: (
            <ProtectedRoute permissions={['view tickets', 'create help requests']} requireAll={false}>
      <CreateTicketPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/tickets/:id',
    element: (
            <ProtectedRoute permission="view tickets">
      <TicketDetailPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/tickets/:id/edit',
    element: (
            <ProtectedRoute permission="edit tickets">
      <TicketEditPage />
            </ProtectedRoute>
    ),
  },
]
