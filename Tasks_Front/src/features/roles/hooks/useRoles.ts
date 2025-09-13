import { useEffect } from 'react'
import { useRolesStore } from '../stores/rolesStore'
import { useFiltersStore } from '../../../stores/filtersStore'

export const useRoles = () => {
  const {
    roles,
    pagination,
    isLoading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole
  } = useRolesStore()

  const { searchQuery } = useFiltersStore()

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleCreateRole = async (data: any) => {
    const role = await createRole(data)
    return role
  }

  const handleUpdateRole = async (id: number, data: any) => {
    const role = await updateRole(id, data)
    return role
  }

  const handleDeleteRole = async (id: number) => {
    return await deleteRole(id)
  }

  // Filter roles based on search query
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return {
    roles: filteredRoles,
    pagination,
    isLoading,
    error,
    fetchRoles,
    createRole: handleCreateRole,
    updateRole: handleUpdateRole,
    deleteRole: handleDeleteRole
  }
}
