import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { supabase } from './supabaseClient';
import { ApiResponse } from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(async (config) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          supabase.auth.signOut();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'API request failed');
    }
    return response.data.data!;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'API request failed');
    }
    return response.data.data!;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(url, data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'API request failed');
    }
    return response.data.data!;
  }

  async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'API request failed');
    }
    return response.data.data!;
  }
}

export const apiClient = new ApiClient();