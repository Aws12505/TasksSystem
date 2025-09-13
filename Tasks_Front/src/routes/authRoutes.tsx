import type { RouteObject } from 'react-router-dom'
import { Suspense, lazy } from 'react'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))

export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LoginPage />
      </Suspense>
    ),
  },
]
