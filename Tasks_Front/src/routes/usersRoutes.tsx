import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoute'

// Import with correct paths - make sure these match your file structure
const UsersPage = lazy(() => import('../features/users/pages/index'))
const UserDetailPage = lazy(() => import('../features/users/pages/UserDetailPage'))
const UserEditPage = lazy(() => import('../features/users/pages/UserEditPage'))
const CreateUserPage = lazy(() => import('../features/users/pages/create'))

export const usersRoutes: RouteObject[] = [
  {
    path: '/users',
    element: (
            <ProtectedRoute permission="view users">
      <UsersPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/users/create',
    element: (
            <ProtectedRoute permission="create users">
      <CreateUserPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/users/:id',
    element: (
            <ProtectedRoute permission="view users">
      <UserDetailPage />
            </ProtectedRoute>
    ),
  },
  {
    path: '/users/:id/edit',
    element: (
            <ProtectedRoute permission="edit users">
      <UserEditPage />
            </ProtectedRoute>
    ),
  },
]
