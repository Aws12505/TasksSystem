import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const PublicCreateTicketPage = lazy(() => import('@/features/public/CreateTicketPage'))
const TicketSuccessPage = lazy(() => import('@/features/public/TicketSuccessPage'))
// const SOSPage = lazy(() => import('@/features/public/SOSPage'))



export const publicRoutes: RouteObject[] = [
  {
    path: '/support-ticket',
    element: (<PublicCreateTicketPage />),
  },
  {
    path: '/support-ticket/success',
    element: (<TicketSuccessPage />),
  },
  // {
  //   path: '/ratings/sos',
  //   element: (<SOSPage />),
  // }
]
