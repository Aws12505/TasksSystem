import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const TicketsPage = lazy(() => import('@/features/tickets/pages/index'))
const TicketDetailPage = lazy(() => import('@/features/tickets/pages/TicketDetailPage'))
const TicketEditPage = lazy(() => import('@/features/tickets/pages/TicketEditPage'))
const CreateTicketPage = lazy(() => import('@/features/tickets/pages/create'))



export const ticketsRoutes: RouteObject[] = [
  {
    path: '/tickets',
    element: (
      <TicketsPage />
    ),
  },
  {
    path: '/tickets/create',
    element: (
      <CreateTicketPage />
    ),
  },
  {
    path: '/tickets/:id',
    element: (
      <TicketDetailPage />
    ),
  },
  {
    path: '/tickets/:id/edit',
    element: (
      <TicketEditPage />
    ),
  },
]
