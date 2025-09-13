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
    fetchUsers()
  }, [fetchUsers])

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

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return {
    users: filteredUsers,
    pagination,
    isLoading,
    error,
    fetchUsers,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser
  }
}
