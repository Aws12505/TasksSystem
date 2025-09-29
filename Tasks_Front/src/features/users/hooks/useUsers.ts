// hooks/useUsers.ts
import { useEffect } from 'react'
import { useUsersStore } from '../stores/usersStore'
import { useFiltersStore } from '../../../stores/filtersStore'

export const useUsers = () => {
  const {
    users,
    pagination,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  } = useUsersStore()

  const { searchQuery } = useFiltersStore()

  useEffect(() => {
    if (!users.length) {
      fetchUsers(1)
    }
  }, [fetchUsers, users.length])

  const handleCreateUser = async (data: any) => {
    const user = await createUser(data)
    return user
  }

  const handleUpdateUser = async (id: number, data: any) => {
    const user = await updateUser(id, data)
    return user
  }

  const handleDeleteUser = async (id: number) => {
    return await deleteUser(id)
  }

  // Filter users based on search query - apply to current page only
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination functions
  const goToPage = (page: number) => {
    fetchUsers(page)
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
    users: filteredUsers,
    pagination,
    isLoading,
    error,
    fetchUsers,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    // Pagination methods
    goToPage,
    nextPage,
    prevPage
  }
}
