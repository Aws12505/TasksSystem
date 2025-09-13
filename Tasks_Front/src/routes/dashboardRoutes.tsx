import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))



export const dashboardRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: (
        <DashboardPage />
    ),
  },
]
