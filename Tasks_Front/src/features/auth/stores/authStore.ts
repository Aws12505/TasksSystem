// src/features/auth/stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../../../services/authService'
import type { User } from '../../../types/User'
import type { Permission } from '../../../types/Permission'
import { toast } from 'sonner'
import type { LoginRequest } from '../../../types/Auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  allPermissions: Permission[] // Combined permissions from roles and direct
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const combinePermissions = (user: User | null): Permission[] => {
  if (!user) return []
  
  const allPermissions: Permission[] = []
  const permissionNames = new Set<string>()
  
  // Add direct permissions
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      allPermissions: [],

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true })
        try {
          const response = await authService.login(credentials)
          
          if (response.success) {
            const { user, token } = response.data
            const allPermissions = combinePermissions(user)
            
            authService.setToken(token)
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              allPermissions
            })
            
            toast.success('Login successful')
          } else {
            toast.error(response.message || 'Login failed')
            set({ isLoading: false })
          }
        } catch (error: any) {
          toast.error(error.message || 'Login failed')
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          authService.removeToken()
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            allPermissions: []
          })
          toast.success('Logged out successfully')
        }
      },

      checkAuth: async () => {
        const token = authService.getToken()
        if (token) {
          const { user } = get()
          const allPermissions = combinePermissions(user)
          set({
            token,
            isAuthenticated: true,
            allPermissions
          })
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            allPermissions: []
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        allPermissions: state.allPermissions,
      }),
      onRehydrateStorage: () => (state) => {
        const token = state?.token ?? authService.getToken()
        if (token) {
          authService.setToken(token)
        }
      },
    }
  )
)
