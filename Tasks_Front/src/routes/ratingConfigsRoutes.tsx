import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const RatingConfigsPage = lazy(() => import('@/features/rating-configs/pages/index'))
const RatingConfigDetailPage = lazy(() => import('@/features/rating-configs/pages/RatingConfigDetailPage'))
const RatingConfigEditPage = lazy(() => import('@/features/rating-configs/pages/RatingConfigEditPage'))
const CreateRatingConfigPage = lazy(() => import('@/features/rating-configs/pages/create'))


export const ratingConfigsRoutes: RouteObject[] = [
  {
    path: '/rating-configs',
    element: (
      <RatingConfigsPage />
    ),
  },
  {
    path: '/rating-configs/create',
    element: (
      <CreateRatingConfigPage />
    ),
  },
  {
    path: '/rating-configs/:id',
    element: (
      <RatingConfigDetailPage />
    ),
  },
  {
    path: '/rating-configs/:id/edit',
    element: (
      <RatingConfigEditPage />
    ),
  },
]
