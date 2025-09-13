import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

// Import with correct paths - make sure these match your file structure
const UsersPage = lazy(() => import('../features/users/pages/index'))
const UserDetailPage = lazy(() => import('../features/users/pages/UserDetailPage'))
const UserEditPage = lazy(() => import('../features/users/pages/UserEditPage'))
const CreateUserPage = lazy(() => import('../features/users/pages/create'))

export const usersRoutes: RouteObject[] = [
  {
    path: '/users',
    element: (
      <UsersPage />
    ),
  },
  {
    path: '/users/create',
    element: (
      <CreateUserPage />
    ),
  },
  {
    path: '/users/:id',
    element: (
      <UserDetailPage />
    ),
  },
  {
    path: '/users/:id/edit',
    element: (
      <UserEditPage />
    ),
  },
]
