import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../../../services/authService'
import type { User } from '../../../types/User'
import type { LoginRequest } from '../../../types/Auth'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true })
        try {
          const response = await authService.login(credentials)
          
          if (response.success) {
            const { user, token } = response.data
            
            authService.setToken(token)
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false
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
            isLoading: false
          })
          toast.success('Logged out successfully')
        }
      },

      checkAuth: async () => {
        const token = authService.getToken()
        if (token) {
          set({
            token,
            isAuthenticated: true
          })
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
