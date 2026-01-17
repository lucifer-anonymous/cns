import axios from 'axios';
import { API_BASE_URL } from '@/config';

export interface AdminLoginCredentials {
  username: string;
  password: string;
}

export interface AdminAuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    username: string;
    role: 'admin' | 'staff';
  };
  message?: string;
}

export const adminService = {
  async login(credentials: AdminLoginCredentials): Promise<AdminAuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/admin/login`, credentials);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Admin login failed. Please try again.'
      };
    }
  },

  async getCurrentAdmin(): Promise<AdminAuthResponse> {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return { success: false, message: 'No admin token found' };
      }
      
      const response = await axios.get(`${API_BASE_URL}/auth/admin/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch admin data'
      };
    }
  }
};

export default adminService;
