// src/routes/profileRoutes.ts
import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoute'

const ProfileSettingsPage = lazy(() => import('@/features/profile/pages/ProfileSettingsPage'))
const PasswordSettingsPage = lazy(() => import('@/features/profile/pages/PasswordSettingsPage'))

export const profileRoutes: RouteObject[] = [
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
          <ProfileSettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/password',
    element: (
      <ProtectedRoute>
          <PasswordSettingsPage />
      </ProtectedRoute>
    ),
  }
]
