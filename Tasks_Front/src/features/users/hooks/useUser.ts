import { useEffect } from 'react'
import { useUsersStore } from '../stores/usersStore'

export const useUser = (userId: number | string) => {
  const {
    currentUser,
    userRolesPermissions,
    availableRoles,
    availablePermissions,
    isLoading,
    error,
    fetchUser,
    fetchUserRolesPermissions,
    fetchAvailableRoles,
    fetchAvailablePermissions,
    syncUserRoles,
    syncUserPermissions,
    clearCurrentUser
  } = useUsersStore()

  const id = typeof userId === 'string' ? parseInt(userId) : userId

  useEffect(() => {
    if (id) {
      fetchUser(id)
      fetchUserRolesPermissions(id)
      fetchAvailableRoles()
      fetchAvailablePermissions()
    }

    return () => {
      clearCurrentUser()
    }
  }, [id, fetchUser, fetchUserRolesPermissions, fetchAvailableRoles, fetchAvailablePermissions, clearCurrentUser])

  return {
    user: currentUser,
    userRolesPermissions,
    availableRoles,
    availablePermissions,
    isLoading,
    error,
    syncUserRoles: (roles: string[]) => syncUserRoles(id, roles),
    syncUserPermissions: (permissions: string[]) => syncUserPermissions(id, permissions)
  }
}
