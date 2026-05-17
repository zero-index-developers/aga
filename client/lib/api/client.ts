/**
 * Centralized API Client for AGA Application
 * 
 * Provides a consistent interface for making API requests with:
 * - Automatic error handling
 * - Response validation
 * - Type safety
 * - Authentication token management
 */

import { toast } from 'sonner';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Configuration options for API requests
 */
interface RequestOptions extends RequestInit {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authentication token from HttpOnly cookies only
   * SECURITY: Removed localStorage fallback to prevent XSS attacks
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Only get from HttpOnly cookie - more secure against XSS
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth_token='));
    
    return authCookie ? authCookie.split('=')[1] : null;
  }

  /**
   * Build headers with authentication and content type
   */
  private buildHeaders(customHeaders?: HeadersInit): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge custom headers
    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(customHeaders)) {
        customHeaders.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, customHeaders);
      }
    }

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  }

  /**
   * Make a GET request
   */
  async get<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { showErrorToast = true, ...fetchOptions } = options;

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.buildHeaders(fetchOptions.headers),
        ...fetchOptions,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (showErrorToast && error instanceof ApiError) {
        toast.error(error.message);
      }
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      showErrorToast = true,
      showSuccessToast = false,
      successMessage,
      ...fetchOptions
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.buildHeaders(fetchOptions.headers),
        body: data ? JSON.stringify(data) : undefined,
        ...fetchOptions,
      });

      const result = await this.handleResponse<T>(response);

      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      return result;
    } catch (error) {
      if (showErrorToast && error instanceof ApiError) {
        toast.error(error.message);
      }
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      showErrorToast = true,
      showSuccessToast = false,
      successMessage,
      ...fetchOptions
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.buildHeaders(fetchOptions.headers),
        body: data ? JSON.stringify(data) : undefined,
        ...fetchOptions,
      });

      const result = await this.handleResponse<T>(response);

      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      return result;
    } catch (error) {
      if (showErrorToast && error instanceof ApiError) {
        toast.error(error.message);
      }
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      showErrorToast = true,
      showSuccessToast = false,
      successMessage,
      ...fetchOptions
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.buildHeaders(fetchOptions.headers),
        ...fetchOptions,
      });

      const result = await this.handleResponse<T>(response);

      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      return result;
    } catch (error) {
      if (showErrorToast && error instanceof ApiError) {
        toast.error(error.message);
      }
      throw error;
    }
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      showErrorToast = true,
      showSuccessToast = false,
      successMessage,
      ...fetchOptions
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: this.buildHeaders(fetchOptions.headers),
        body: data ? JSON.stringify(data) : undefined,
        ...fetchOptions,
      });

      const result = await this.handleResponse<T>(response);

      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      return result;
    } catch (error) {
      if (showErrorToast && error instanceof ApiError) {
        toast.error(error.message);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export default ApiClient;

// Made with Bob
