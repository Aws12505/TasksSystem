import { apiClient } from './api';
import type { LoginRequest, LoginResponse } from '../types/Auth';
import type { ApiResponse } from '../types/ApiResponse';

export class AuthService {
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>('/login', data);
  }

  async logout(): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/logout');
  }

  
  // Helper methods for token management
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
