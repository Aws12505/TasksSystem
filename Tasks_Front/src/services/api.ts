// services/api.ts
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { ApiResponse, PaginatedApiResponse } from '../types/ApiResponse';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = 'https://tasksbackend.rdexperts.tech/api';

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: object): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, { params });
    return response.data;
  }

  async getPaginated<T>(url: string, params?: object): Promise<PaginatedApiResponse<T>> {
    const response: AxiosResponse<PaginatedApiResponse<T>> = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: object): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: object): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url);
    return response.data;
  }

  async postMultipart<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }
}

export const apiClient = new ApiClient();
