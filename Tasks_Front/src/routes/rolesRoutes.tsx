import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const RolesPage = lazy(() => import('@/features/roles/pages/index'))
const RoleDetailPage = lazy(() => import('@/features/roles/pages/RoleDetailPage'))
const RoleEditPage = lazy(() => import('@/features/roles/pages/RoleEditPage'))
const CreateRolePage = lazy(() => import('@/features/roles/pages/create'))

export const rolesRoutes: RouteObject[] = [
  {
    path: '/roles',
    element: (
      <RolesPage />
    ),
  },
  {
    path: '/roles/create',
    element: (
      <CreateRolePage />
    ),
  },
  {
    path: '/roles/:id',
    element: (
      <RoleDetailPage />
    ),
  },
  {
    path: '/roles/:id/edit',
    element: (
      <RoleEditPage />
    ),
  },
]
