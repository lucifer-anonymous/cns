import axios from 'axios';
import { API_BASE_URL } from '@/config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'staff';
}

export interface UserData {
  id: string;
  _id?: string; // For backward compatibility
  name: string;
  email: string;
  username?: string;
  role: 'admin' | 'staff' | 'student';
  mobile?: string;
  isVerified?: boolean;
  registrationNumber?: string;
  registrationNo?: string; // MongoDB field name
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  data?: UserData;
  user?: UserData; // For backward compatibility
  message?: string;
}

export const authService = {
  // Admin/Staff login via new dedicated endpoint
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/admin-auth/login`, {
        username: credentials.username.trim(),
        password: credentials.password
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your username and password.'
      };
    }
  },

  // Admin/Staff registration
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/admin-auth/register`, {
        name: credentials.name.trim(),
        username: credentials.username.trim(),
        email: credentials.email.trim(),
        password: credentials.password,
        role: credentials.role || 'staff'
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  },

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No token found' };
      }
      
      // Try admin-auth endpoint first, fallback to general auth endpoint
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/admin-auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      } catch (adminError: any) {
        // If admin-auth fails, try the general auth endpoint
        const response = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user data'
      };
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    // Clear any other user-related data
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

export default authService;
