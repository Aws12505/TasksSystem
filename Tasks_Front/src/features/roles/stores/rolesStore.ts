import { create } from 'zustand'
import { roleService } from '../../../services/roleService'
import { permissionService } from '../../../services/permissionService'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../../../types/Role'
import type { Permission } from '../../../types/Permission'
import { toast } from 'sonner'

interface RolesState {
  roles: Role[]
  currentRole: Role | null
  availablePermissions: Permission[]
  pagination: {
    current_page: number
    total: number
    per_page: number
    last_page: number
  } | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchRoles: (page?: number) => Promise<void>
  fetchRole: (id: number) => Promise<void>
  fetchAvailablePermissions: () => Promise<void>
  createRole: (data: CreateRoleRequest) => Promise<Role | null>
  updateRole: (id: number, data: UpdateRoleRequest) => Promise<Role | null>
  deleteRole: (id: number) => Promise<boolean>
  clearCurrentRole: () => void
}

export const useRolesStore = create<RolesState>((set, get) => ({
  roles: [],
  currentRole: null,
  availablePermissions: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchRoles: async (page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await roleService.getRoles(page)
      if (response.success) {
        set({
          roles: response.data,
          pagination: response.pagination,
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch roles'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchRole: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await roleService.getRole(id)
      if (response.success) {
        set({ currentRole: response.data, isLoading: false })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch role'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
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

  createRole: async (data: CreateRoleRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await roleService.createRole(data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Role created successfully')
        // Refresh roles list
        get().fetchRoles()
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create role'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  updateRole: async (id: number, data: UpdateRoleRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await roleService.updateRole(id, data)
      if (response.success) {
        set({ currentRole: response.data, isLoading: false })
        toast.success('Role updated successfully')
        // Refresh roles list
        get().fetchRoles()
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update role'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  deleteRole: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await roleService.deleteRole(id)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Role deleted successfully')
        // Refresh roles list
        get().fetchRoles()
        return true
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete role'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  clearCurrentRole: () => set({ currentRole: null, error: null })
}))
