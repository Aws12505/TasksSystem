import { apiClient } from './api'
import type { ApiResponse } from '../types/ApiResponse'
import type { UpdatePasswordBody, UpdateProfileBody } from '../types/Profile'
import type { User } from '../types/User'

class ProfileService {
  async me(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/me')
  }

  async updateProfile(data: UpdateProfileBody & { avatar?: File | null }): Promise<ApiResponse<User>> {
    const form = new FormData()
    if (data.name) form.append('name', data.name)
    if (data.email) form.append('email', data.email)
    if (data.avatar) form.append('avatar', data.avatar)
    return apiClient.postMultipart<User>('/profile', form)
  }

  async updatePassword(body: UpdatePasswordBody): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/profile/password', body)
  }
}

export const profileService = new ProfileService()
