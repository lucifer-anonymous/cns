import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse, AxiosHeaders } from 'axios';

// Add fallback for crypto.randomUUID()
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  // Fallback for browsers that don't support crypto.randomUUID()
  crypto.randomUUID = function(): `${string}-${string}-${string}-${string}-${string}` {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }) as `${string}-${string}-${string}-${string}-${string}`;
  };
} else if (typeof crypto === 'undefined') {
  // Fallback for environments where crypto is not available
  (globalThis as any).crypto = {
    randomUUID: function(): `${string}-${string}-${string}-${string}-${string}` {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }) as `${string}-${string}-${string}-${string}-${string}`;
    }
  };
}

// Environment configuration
const isDevelopment = import.meta.env.DEV;
// Base URL is set to empty string since we're using full paths in services
const apiBaseUrl = '';

// Configure axios instance with default settings
const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // Enable sending cookies with cross-origin requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 15000, // 15 seconds timeout
  validateStatus: (status) => {
    // Consider status codes less than 500 as success
    return status < 500;
  }
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // Add CORS headers
      config.headers = config.headers || new AxiosHeaders();
      config.headers['Access-Control-Allow-Origin'] = window.location.origin;
      config.headers['Access-Control-Allow-Credentials'] = 'true';
      
      // Skip adding Authorization header for registration endpoint
      if (!config.url?.includes('/student/register')) {
        const token = localStorage.getItem('token');
        console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NULL');
        if (token) {
          config.headers.Authorization = token.startsWith('Bearer ')
            ? token
            : `Bearer ${token}`;
          console.log('✅ Authorization header set:', config.headers.Authorization ? `${config.headers.Authorization.substring(0, 30)}...` : 'NULL');
        } else {
          console.warn('⚠️ No token found in localStorage!');
        }
      }
      
      // Only add request ID if crypto is available
      try {
        const requestId = crypto.randomUUID();
        config.headers['X-Request-ID'] = requestId;
      } catch (e) {
        console.warn('Could not generate request ID:', e);
      }
      
      if (isDevelopment) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
          headers: config.headers
        });
      }
    }
    return config;
  },
  (error) => {
    // Handle CORS errors
    if (error.response?.status === 0) {
      console.error('Network Error or CORS issue:', error);
      return Promise.reject(new Error('Network Error: Please check your connection and CORS settings.'));
    }
    console.error('Response Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle CORS headers in the response
    if (response.headers['access-control-allow-origin']) {
      response.headers['Access-Control-Allow-Origin'] = response.headers['access-control-allow-origin'];
    }
    if (response.headers['access-control-allow-credentials']) {
      response.headers['Access-Control-Allow-Credentials'] = response.headers['access-control-allow-credentials'];
    }

    if (isDevelopment) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      // Log response headers for debugging
      console.log('Response headers:', {
        'content-type': response.headers['content-type'],
        'content-length': response.headers['content-length'],
        'etag': response.headers['etag'],
        'access-control-allow-origin': response.headers['access-control-allow-origin'],
        'access-control-allow-credentials': response.headers['access-control-allow-credentials']
      });
    }
    
    // Ensure we always return the response data
    return response;
  },
  (error: AxiosError) => {
    if (isDevelopment) {
      console.error('[API Error]', {
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        },
        response: error.response ? {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        } : 'No response received'
      });
    }
    
    // Create a consistent error response
    const status = error.response?.status || 0;
    const data = error.response?.data || {};
    const errorResponse = {
      status,
      message: (data as any)?.message || error.message || 'An error occurred',
      errors: (data as any)?.errors,
      data: (data as any)?.data,
      originalError: error
    };

    // Handle specific status codes
    switch (status) {
      case 401: // Unauthorized
        errorResponse.message = 'Your session has expired. Please log in again.';
        // Clear invalid token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('student/login')) {
            window.location.href = '/student/login';
          }
        }
        break;
      case 403: // Forbidden
        errorResponse.message = 'You do not have permission to access this resource.';
        break;
      case 404: // Not Found
        errorResponse.message = 'The requested resource was not found.';
        break;
      case 500: // Internal Server Error
        errorResponse.message = 'An unexpected error occurred. Please try again later.';
        break;
    }

    // Return the enhanced error response
    return Promise.reject(errorResponse);
  }
);

// Export the configured axios instance
export default api;

// Type definitions for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Type for paginated responses
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Helper function to handle API responses
const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  const { data } = response;
  if (!data.success) {
    throw new Error(data.message || 'Request failed');
  }
  return data.data as T;
};

// Helper function to handle paginated responses
const handlePaginatedResponse = <T>(
  response: AxiosResponse<PaginatedResponse<T>>
): PaginatedResponse<T> => {
  const { data } = response;
  if (!data.success) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

// Export helper functions
export const apiClient = {
  get: <T = any>(url: string, config?: any): Promise<T> => 
    api.get<ApiResponse<T>>(url, config).then(handleResponse),
    
  post: <T = any>(url: string, data?: any, config?: any): Promise<T> => 
    api.post<ApiResponse<T>>(url, data, config).then(handleResponse),
    
  put: <T = any>(url: string, data?: any, config?: any): Promise<T> => 
    api.put<ApiResponse<T>>(url, data, config).then(handleResponse),
    
  delete: <T = any>(url: string, config?: any): Promise<T> => 
    api.delete<ApiResponse<T>>(url, config).then(handleResponse),
    
  // Paginated requests
  getPaginated: <T = any>(url: string, config?: any): Promise<PaginatedResponse<T>> => 
    api.get<PaginatedResponse<T>>(url, config).then(handlePaginatedResponse),
};

// Export the raw axios instance for cases where more control is needed
export const axiosInstance = api;
