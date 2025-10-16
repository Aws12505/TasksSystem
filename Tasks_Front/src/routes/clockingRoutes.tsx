import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoute'

// Import with correct paths - make sure these match your file structure
const ClockingPage = lazy(() => import('../features/clocking/pages/ClockingPage'))
const ClockingManagerPage = lazy(() => import('../features/clocking/pages/ClockingManagerPage'))
const ClockingRecordsPage = lazy(() => import('../features/clocking/pages/ClockingRecordsPage'))

export const clockingRoutes: RouteObject[] = [
  {
    path: '/clocking',
    element: (
            <ProtectedRoute>
      <ClockingPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/clocking/records',
    element: (
            <ProtectedRoute>
      <ClockingRecordsPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/clocking/manager',
    element: (
            <ProtectedRoute permission="view all clocking sessions">
      <ClockingManagerPage />
            </ProtectedRoute>
    ),
  },
]
