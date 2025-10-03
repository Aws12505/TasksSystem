// src/features/profile/stores/profileStore.ts
import { create } from 'zustand'
import { profileService } from '@/services/profileService'
import type { User } from '@/types/User'
import type { UpdatePasswordBody, UpdateProfileBody } from '@/types/Profile'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/stores/authStore'  // Import the authStore to sync permissions
import type { Permission } from '@/types/Permission'

interface ProfileState {
  me: User | null
  loading: boolean
  error: string | null
  fetchMe: () => Promise<void>
  updateProfile: (data: UpdateProfileBody & { avatar?: File | null }) => Promise<User | null>
  updatePassword: (data: UpdatePasswordBody) => Promise<boolean>
}

export const useProfileStore = create<ProfileState>((set) => ({
  me: null,
  loading: false,
  error: null,

  fetchMe: async () => {
    set({ loading: true, error: null })
    try {
      const res = await profileService.me()
      if (res.success) {
        const user = res.data
        set({ me: user, loading: false })

        // Sync the user details and permissions with the authStore
        const allPermissions = combinePermissions(user)  // Combine permissions from roles and user
        useAuthStore.setState({
          user,
          allPermissions, // Update permissions in the authStore
          isAuthenticated: true,
        })
      } else {
        set({ error: res.message, loading: false })
        toast.error(res.message)
      }
    } catch (e: any) {
      set({ error: e.message || 'Failed to load profile', loading: false })
      toast.error(e.message || 'Failed to load profile')
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null })
    try {
      const res = await profileService.updateProfile(data)
      if (res.success) {
        const updatedUser = res.data
        set({ me: updatedUser, loading: false })
        useAuthStore.setState({ user: updatedUser })  // Update the authStore with the updated user
        toast.success('Profile updated')
        return updatedUser
      } else {
        set({ error: res.message, loading: false })
        toast.error(res.message)
        return null
      }
    } catch (e: any) {
      set({ error: e.message || 'Failed to update profile', loading: false })
      toast.error(e.message || 'Failed to update profile')
      return null
    }
  },

  updatePassword: async (data) => {
    set({ loading: true, error: null })
    try {
      const res = await profileService.updatePassword(data)
      set({ loading: false })
      if (res.success) {
        toast.success('Password updated')
        return true
      } else {
        toast.error(res.message)
        return false
      }
    } catch (e: any) {
      set({ loading: false, error: e.message || 'Failed to update password' })
      toast.error(e.message || 'Failed to update password')
      return false
    }
  }
}))

// Helper function to combine permissions from roles and user directly
const combinePermissions = (user: User | null): Permission[] => {
  if (!user) return []
  
  const allPermissions: Permission[] = []
  const permissionNames = new Set<string>()

  // Add direct permissions from the user
  if (user.permissions) {
    user.permissions.forEach(permission => {
      if (!permissionNames.has(permission.name)) {
        allPermissions.push(permission)
        permissionNames.add(permission.name)
      }
    })
  }

  // Add permissions from roles
  if (user.roles) {
    user.roles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(permission => {
          if (!permissionNames.has(permission.name)) {
            allPermissions.push(permission)
            permissionNames.add(permission.name)
          }
        })
      }
    })
  }
  
  return allPermissions
}
