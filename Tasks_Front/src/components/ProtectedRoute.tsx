// components/ProtectedRoute.tsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { usePermissions } from '../hooks/usePermissions'
import type { PermissionName } from '../types/User'

interface ProtectedRouteProps {
  children: React.ReactNode
  permission?: PermissionName
  permissions?: PermissionName[]
  requireAll?: boolean // If true, requires ALL permissions, if false requires ANY
  role?: string
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  fallback = <Navigate to="/dashboard" replace />
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = usePermissions()
  
  let hasAccess = true
  
  // Check single permission
  if (permission && !hasPermission(permission)) {
    hasAccess = false
  }
  
  // Check multiple permissions
  if (permissions) {
    if (requireAll && !hasAllPermissions(permissions)) {
      hasAccess = false
    } else if (!requireAll && !hasAnyPermission(permissions)) {
      hasAccess = false
    }
  }
  
  // Check role
  if (role && !hasRole(role)) {
    hasAccess = false
  }
  
  return hasAccess ? <>{children}</> : <>{fallback}</>
}
