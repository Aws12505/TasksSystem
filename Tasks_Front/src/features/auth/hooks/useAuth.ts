import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import type { LoginRequest } from '../../../types/Auth'

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: loginAction,
    logout: logoutAction,
    checkAuth
  } = useAuthStore()

  const navigate = useNavigate()

  const login = async (credentials: LoginRequest) => {
    try {
      await loginAction(credentials)
      navigate('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    await logoutAction()
    navigate('/login')
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth
  }
}
