import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const RatingConfigsPage = lazy(() => import('@/features/rating-configs/pages/index'))
const RatingConfigDetailPage = lazy(() => import('@/features/rating-configs/pages/RatingConfigDetailPage'))
const RatingConfigEditPage = lazy(() => import('@/features/rating-configs/pages/RatingConfigEditPage'))
const CreateRatingConfigPage = lazy(() => import('@/features/rating-configs/pages/create'))


export const ratingConfigsRoutes: RouteObject[] = [
  {
    path: '/rating-configs',
    element: (
            <ProtectedRoute permission="view rating configs">
      <RatingConfigsPage />
    </ProtectedRoute>
    ),
  },
  {
    path: '/rating-configs/create',
    element: (
            <ProtectedRoute permission="create rating configs">
      <CreateRatingConfigPage />
    </ProtectedRoute>
    ),
  },
  {
    path: '/rating-configs/:id',
    element: (
      <ProtectedRoute permission="view rating configs">
        <RatingConfigDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/rating-configs/:id/edit',
    element: (
            <ProtectedRoute permission="edit rating configs">
        <RatingConfigEditPage />
      </ProtectedRoute>
    ),
  },
]
