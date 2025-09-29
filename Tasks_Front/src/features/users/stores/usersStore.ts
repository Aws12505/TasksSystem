// stores/usersStore.ts
import { create } from 'zustand'
import { userService } from '../../../services/userService'
import { roleService } from '../../../services/roleService'
import { permissionService } from '../../../services/permissionService'
import type { User, CreateUserRequest, UpdateUserRequest, UserRolesAndPermissions } from '../../../types/User'
import type { Role } from '../../../types/Role'
import type { Permission } from '../../../types/Permission'
import { toast } from 'sonner'

interface PaginationInfo {
  current_page: number
  total: number
  per_page: number
  last_page: number
  from: number | null
  to: number | null
}

interface UsersState {
  users: User[]
  currentUser: User | null
  userRolesPermissions: UserRolesAndPermissions | null
  availableRoles: Role[]
  availablePermissions: Permission[]
  pagination: PaginationInfo | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchUsers: (page?: number) => Promise<void>
  fetchUser: (id: number) => Promise<void>
  fetchUserRolesPermissions: (userId: number) => Promise<void>
  fetchAvailableRoles: () => Promise<void>
  fetchAvailablePermissions: () => Promise<void>
  createUser: (data: CreateUserRequest) => Promise<User | null>
  updateUser: (id: number, data: UpdateUserRequest) => Promise<User | null>
  deleteUser: (id: number) => Promise<boolean>
  syncUserRoles: (userId: number, roles: string[]) => Promise<boolean>
  syncUserPermissions: (userId: number, permissions: string[]) => Promise<boolean>
  clearCurrentUser: () => void
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  currentUser: null,
  userRolesPermissions: null,
  availableRoles: [],
  availablePermissions: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchUsers: async (page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await userService.getUsers(page)
      if (response.success) {
        set({
          users: response.data,
          pagination: response.pagination || {
            current_page: 1,
            total: response.data.length,
            per_page: 15,
            last_page: 1,
            from: response.data.length > 0 ? 1 : null,
            to: response.data.length
          },
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch users'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchUser: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await userService.getUser(id)
      if (response.success) {
        set({ currentUser: response.data, isLoading: false })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch user'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchUserRolesPermissions: async (userId: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await userService.getUserRolesAndPermissions(userId)
      if (response.success) {
        set({ userRolesPermissions: response.data, isLoading: false })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch user roles and permissions'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchAvailableRoles: async () => {
    try {
      const response = await roleService.getRoles(1, 100) // Get all roles
      if (response.success) {
        set({ availableRoles: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch roles:', error)
    }
  },

  fetchAvailablePermissions: async () => {
    try {
      const response = await permissionService.getPermissions()
      if (response.success) {
        set({ availablePermissions: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch permissions:', error)
    }
  },

  createUser: async (data: CreateUserRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await userService.createUser(data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('User created successfully')
        // Refresh users list
        get().fetchUsers()
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create user'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  updateUser: async (id: number, data: UpdateUserRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await userService.updateUser(id, data)
      if (response.success) {
        set({ currentUser: response.data, isLoading: false })
        toast.success('User updated successfully')
        // Refresh users list
        get().fetchUsers()
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update user'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  deleteUser: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await userService.deleteUser(id)
      if (response.success) {
        set({ isLoading: false })
        toast.success('User deleted successfully')
        // Refresh users list
        get().fetchUsers()
        return true
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete user'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  syncUserRoles: async (userId: number, roles: string[]) => {
    try {
      const response = await userService.syncUserRoles(userId, { roles })
      if (response.success) {
        toast.success('User roles updated successfully')
        // Refresh user data
        get().fetchUser(userId)
        get().fetchUserRolesPermissions(userId)
        return true
      } else {
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user roles')
      return false
    }
  },

  syncUserPermissions: async (userId: number, permissions: string[]) => {
    try {
      const response = await userService.syncUserPermissions(userId, { permissions })
      if (response.success) {
        toast.success('User permissions updated successfully')
        // Refresh user data
        get().fetchUser(userId)
        get().fetchUserRolesPermissions(userId)
        return true
      } else {
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user permissions')
      return false
    }
  },

  clearCurrentUser: () => set({ 
    currentUser: null, 
    userRolesPermissions: null 
  })
}))
