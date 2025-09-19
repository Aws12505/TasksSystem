import { createBrowserRouter, Navigate } from 'react-router-dom'
import React, { Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AuthGuard from './features/auth/components/AuthGuard'
import MainLayout from './components/layout/MainLayout'
import App from './App'
import { authRoutes } from './routes/authRoutes'
import { dashboardRoutes } from './routes/dashboardRoutes'
import { usersRoutes } from './routes/usersRoutes'
import { rolesRoutes } from './routes/rolesRoutes'
import { projectsRoutes } from './routes/projectsRoutes'
import { tasksRoutes } from './routes/tasksRoutes'
import { helpRequestsRoutes } from './routes/helpRequestsRoutes'
import { ticketsRoutes } from './routes/ticketsRoutes'
import { ratingConfigsRoutes } from './routes/ratingConfigsRoutes'
import { ratingsRoutes } from './routes/ratingsRoutes'
import { analyticsRoutes } from './routes/analyticsRoutes'
import { publicRoutes } from './routes/publicRoutes'

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
)

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation()
  
  return (
    <AuthGuard>
      <MainLayout>
        <Suspense fallback={<LoadingSpinner />} key={location.key}>
          {children}
        </Suspense>
      </MainLayout>
    </AuthGuard>
  )
}

const wrapWithSuspense = (routes: any[]) =>
  routes.map(route => ({
    ...route,
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {route.element}
      </Suspense>
    ),
  }))

const wrapProtectedRoutes = (routes: any[]) => 
  routes.map(route => ({
    ...route,
    element: <ProtectedRoute>{route.element}</ProtectedRoute>
  }))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Public routes
      ...wrapWithSuspense(authRoutes),
      ...wrapWithSuspense(publicRoutes),
      // Protected routes (single Suspense wrapping)
      ...wrapProtectedRoutes(dashboardRoutes),
      ...wrapProtectedRoutes(usersRoutes),
      ...wrapProtectedRoutes(rolesRoutes), 
      ...wrapProtectedRoutes(projectsRoutes),
      ...wrapProtectedRoutes(tasksRoutes),
      ...wrapProtectedRoutes(helpRequestsRoutes),
      ...wrapProtectedRoutes(ticketsRoutes),
      ...wrapProtectedRoutes(ratingConfigsRoutes),
      ...wrapProtectedRoutes(ratingsRoutes),
      ...wrapProtectedRoutes(analyticsRoutes),
      
      {
        path: '/',
        element: <Navigate to="/login" replace />,
      },
      {
        path: '*',
        element: <Navigate to="/login" replace />,
      }
    ]
  }
])
