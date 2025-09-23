// hooks/usePermissions.ts
import { useAuthStore } from '../features/auth/stores/authStore'
import type { PermissionName } from '../types/User'

export const usePermissions = () => {
  const { user } = useAuthStore()
  
  const hasPermission = (permission: PermissionName): boolean => {
    if (!user || !user.permissions) return false
    
    // Check if user has the permission directly or through roles
    return user.permissions.some(p => p.name === permission)
  }
  
  const hasRole = (roleName: string): boolean => {
    if (!user || !user.roles) return false
    return user.roles.some(role => role.name === roleName)
  }
  
  const hasAnyPermission = (permissions: PermissionName[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }
  
  const hasAllPermissions = (permissions: PermissionName[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }
  
  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions: user?.permissions?.map(p => p.name) || []
  }
}
