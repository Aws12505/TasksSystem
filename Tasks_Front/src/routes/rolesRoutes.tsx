import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoute'

const RolesPage = lazy(() => import('@/features/roles/pages/index'))
const RoleDetailPage = lazy(() => import('@/features/roles/pages/RoleDetailPage'))
const RoleEditPage = lazy(() => import('@/features/roles/pages/RoleEditPage'))
const CreateRolePage = lazy(() => import('@/features/roles/pages/create'))

export const rolesRoutes: RouteObject[] = [
  {
    path: '/roles',
    element: (
            <ProtectedRoute permission="view roles">
      <RolesPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/roles/create',
    element: (
            <ProtectedRoute permission="create roles">
      <CreateRolePage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/roles/:id',
    element: (
            <ProtectedRoute permission="view roles">
      <RoleDetailPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/roles/:id/edit',
    element: (
            <ProtectedRoute permission="edit roles">
      <RoleEditPage />
            </ProtectedRoute>
    ),
  },
]
