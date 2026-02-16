import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { supabase } from './supabaseClient';
import { ApiResponse } from '../types';
import { appConfig } from './config';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: appConfig.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(async (config) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${session.access_token}`,
        };
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
      },
    );
  }

  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (!response.data.success) {
      const message =
        response.data.error?.message || 'Something went wrong. Please try again.';
      throw new Error(message);
    }
    return response.data.data as T;
  }

  async get<T>(url: string): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url);
    return this.handleResponse(response);
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(
      url,
      data,
    );
    return this.handleResponse(response);
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(
      url,
      data,
    );
    return this.handleResponse(response);
  }

  async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url);
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();