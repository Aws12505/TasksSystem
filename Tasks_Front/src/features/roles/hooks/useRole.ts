import { useEffect } from 'react'
import { useRolesStore } from '../stores/rolesStore'

export const useRole = (roleId: number | string) => {
  const {
    currentRole,
    availablePermissions,
    isLoading,
    error,
    fetchRole,
    fetchAvailablePermissions,
    clearCurrentRole
  } = useRolesStore()

  const id = typeof roleId === 'string' ? parseInt(roleId) : roleId

  useEffect(() => {
    if (id) {
      fetchRole(id)
      fetchAvailablePermissions()
    }

    return () => {
      clearCurrentRole()
    }
  }, [id, fetchRole, fetchAvailablePermissions, clearCurrentRole])

  return {
    role: currentRole,
    availablePermissions,
    isLoading,
    error
  }
}
