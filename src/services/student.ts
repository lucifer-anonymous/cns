import { apiClient } from '@/lib/api';
import api from '@/services/api';


// Type definitions
export interface Student {
  _id: string;
  name: string;
  email: string;
  registrationNo: string;
  mobile?: string;
  role: 'student' | 'admin' | 'staff';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: any; 
  token?: string;
  _id?: string;
  name?: string;
  email?: string;
  registrationNo?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterPayload {
  name: string;
  registrationNo: string;
  email: string;
  password: string;
}

export interface VerifyPayload {
  registrationNo: string;
  otp: string;
}

export interface LoginPayload {
  registrationNo: string;
  password: string;
}

/**
 * Register a new student
 * @param payload Student registration data
 * @returns Promise with registration result
 */
export async function studentRegister(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    console.log('Sending registration request with payload:', payload);
    
    const response = await api.post<AuthResponse>(
      '/api/v1/student/register', 
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        withCredentials: false
      }
    );
    
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Registration failed:', error);
    
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.response) {
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = `Registration failed with status ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection and try again.';
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Verify student's OTP
 * @param payload Verification data
 * @returns Promise with verification result
 */
export async function studentVerify(payload: VerifyPayload): Promise<AuthResponse> {
  try {
    console.log('Sending verification request with payload:', payload);
    
    const response = await api.post<AuthResponse>(
      '/api/v1/student/verify', 
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        withCredentials: false
      }
    );
    
    console.log('Verification successful:', response.data);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return {
      success: response.data.success ?? true,
      message: response.data.message,
      data: response.data.data,
      token: response.data.token
    };
    
  } catch (error: any) {
    console.error('Verification failed:', error);
    
    let errorMessage = 'Verification failed. Please try again.';
    
    if (error.response) {
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = `Verification failed with status ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection and try again.';
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Student login
 * @param payload Login credentials
 * @returns Promise with login result
 */
export async function studentLogin(payload: LoginPayload): Promise<AuthResponse> {
  try {
    console.log('Login request payload:', payload);
    const response = await api.post('/api/v1/student/login', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    });

    console.log('Login response:', response.data);
    
    // The backend returns: { success: true, data: {user object}, token: 'jwt...' }
    // So we need to extract token from the top level
    const topLevelData = response.data;
    
    if (!topLevelData) {
      console.error('Empty response from server');
      throw new Error('Invalid response from server');
    }

    // Check if login failed
    if (topLevelData.success === false) {
      throw new Error(topLevelData.message || 'Login failed');
    }

    // Extract user data and token
    const userData = topLevelData.data;
    const token = topLevelData.token;
    
    console.log('Extracted user data:', userData);
    console.log('Extracted token:', token ? `${token.substring(0, 20)}...` : 'NULL');
    
    if (!userData || !userData._id) {
      console.error('Invalid user data structure:', userData);
      throw new Error('Invalid user data received from server');
    }

    if (!token) {
      console.error('No token received from server!');
      throw new Error('No authentication token received');
    }

    return {
      success: true,
      message: topLevelData.message || 'Login successful',
      data: userData,
      token: token
    };
  } catch (error: any) {
    console.error('Login error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      response: error.response
    });
    
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'Invalid credentials. Please check your registration number and password.';
      } else if (error.response.status === 404) {
        errorMessage = 'Account not found. Please register first.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Get current student profile
 * @returns Promise with student data
 */
export async function getStudentProfile(): Promise<Student> {
  try {
    const response = await apiClient.get<{ data: Student }>('/api/v1/student/profile');
    
    if (response.data?.data) {
      return response.data.data;
    }
    
    throw new Error('Invalid profile data received from server');
    
  } catch (error: any) {
    console.error('Failed to fetch student profile:', error);
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        'Failed to load profile. Please try again.';
    throw new Error(errorMessage);
  }
}
