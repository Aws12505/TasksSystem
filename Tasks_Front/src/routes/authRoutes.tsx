import type { RouteObject } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))

export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: (
<Suspense fallback={<div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>} >
          <LoginPage />
      </Suspense>
    ),
  },
]
