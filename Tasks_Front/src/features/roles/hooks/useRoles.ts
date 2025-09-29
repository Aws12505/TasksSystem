// hooks/useRoles.ts
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
    if (!roles.length) {
      fetchRoles(1)
    }
  }, [fetchRoles, roles.length])

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

  // Filter roles based on search query - apply to current page only
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination functions
  const goToPage = (page: number) => {
    fetchRoles(page)
  }

  const nextPage = () => {
    if (pagination && pagination.current_page < pagination.last_page) {
      goToPage(pagination.current_page + 1)
    }
  }

  const prevPage = () => {
    if (pagination && pagination.current_page > 1) {
      goToPage(pagination.current_page - 1)
    }
  }

  return {
    roles: filteredRoles,
    pagination,
    isLoading,
    error,
    fetchRoles,
    createRole: handleCreateRole,
    updateRole: handleUpdateRole,
    deleteRole: handleDeleteRole,
    // Pagination methods
    goToPage,
    nextPage,
    prevPage
  }
}
