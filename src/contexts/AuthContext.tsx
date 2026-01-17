import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { LoginCredentials, UserData, AuthResponse } from '@/services/auth.service';

type UserRoleType = 'admin' | 'staff' | 'student';

interface AuthContextType {
  user: UserData | null;
  role: UserRoleType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  loginStudent: (userData: { 
    id: string; 
    name: string; 
    email?: string;
    registrationNumber: string; 
    mobile?: string;
    role?: string;
    isVerified?: boolean;
  }) => void;
  loginAdmin: (userData: {
    id: string;
    name: string;
    email: string;
    username?: string;
    role: 'admin' | 'staff';
    token?: string;
  }) => Promise<{ success: boolean, data: UserData, token?: string }>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [role, setRole] = useState<UserRoleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        // Try to get user from localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser && isAuthenticated) {
          try {
            const userData = JSON.parse(storedUser);
            if (userData && userData.role) {
              console.log('Found stored user:', userData);
              setUser(userData);
              setRole(userData.role as UserRoleType);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error('Error parsing stored user data:', e);
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
          }
        }

        // Fallback to token-based auth
        const token = authService.getToken();
        if (token) {
          const response = await authService.getCurrentUser();
          if (response.success && response.user) {
            const userData = {
              ...response.user,
              role: response.user.role as UserRoleType
            };
            setUser(userData);
            setRole(userData.role);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []); // Removed user dependency to prevent infinite loop

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await authService.login(credentials);
      if (response.success && (response.data || response.user)) {
        const userData = response.data || response.user!;
        const user: UserData = {
          id: userData.id || userData._id || '',
          name: userData.name,
          email: userData.email,
          username: userData.username,
          role: userData.role as UserRoleType
        };
        
        setUser(user);
        setRole(user.role);
        localStorage.setItem('user', JSON.stringify(user));
        
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('isAuthenticated', 'true');
        }
        
        return { 
          success: true, 
          data: user,
          token: response.token 
        };
      }
      
      return { 
        success: false, 
        message: response.message || 'Login failed',
        data: undefined
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'An error occurred during login',
        data: undefined
      };
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  }, [navigate]);

  const loginAdmin = useCallback(async ({ id, name, email, username, role, token }: { 
    id: string; 
    name: string; 
    email: string; 
    username?: string;
    role: 'admin' | 'staff'; 
    token?: string 
  }) => {
    const userData = { id, name, email, username, role };
    setUser(userData);
    setRole(role);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', 'true');
    }
    return { success: true, data: userData, token };
  }, []);

  const loginStudent = useCallback((userData: { 
    id: string; 
    name: string; 
    email?: string;
    registrationNumber?: string;
    registrationNo?: string;
    mobile?: string;
    role?: UserRoleType;
    isVerified?: boolean;
    token?: string;
  }) => {
    // Set role to 'student' for student logins
    const role: UserRoleType = 'student';
    
    const user: UserData = {
      id: userData.id,
      name: userData.name,
      email: userData.email || '',
      role: role,
      mobile: userData.mobile || '',
      isVerified: userData.isVerified !== undefined ? userData.isVerified : true,
      registrationNo: userData.registrationNo || userData.registrationNumber,
      registrationNumber: userData.registrationNumber || userData.registrationNo
    };
    
    console.log('Setting user role to:', role, 'Original role from server:', userData.role);
    console.log('Setting user in context:', user);
    console.log('Token being stored:', userData.token ? 'Yes' : 'No');
    
    setUser(user);
    setRole(role);
    
    // Store user data and token in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    if (userData.token) {
      console.log('Storing token in localStorage');
      localStorage.setItem('token', userData.token);
    } else {
      console.warn('No token provided to loginStudent!');
    }
    localStorage.setItem('isAuthenticated', 'true');
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    // Check if we have a user in state
    if (user) return true;
    
    // Check if we have a token and isAuthenticated flag
    const hasToken = !!localStorage.getItem('token');
    const isAuthFlagSet = localStorage.getItem('isAuthenticated') === 'true';
    const storedUser = localStorage.getItem('user');
    
    // If we have a token, isAuthenticated flag, and a stored user, return true
    if (hasToken && isAuthFlagSet && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData && userData.role) {
          // Update the context with the stored user data
          setUser(userData);
          setRole(userData.role);
          return true;
        }
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
    }
    
    return false;
  }, [user]);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (isAuthenticated() && !user) {
      const response = await authService.getCurrentUser();
      if (response.success && response.user) {
        const userData = {
          ...response.user,
          role: response.user.role as UserRoleType
        };
        setUser(userData);
        setRole(userData.role);
        return true;
      }
      return false;
    }
    return !!user;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: isAuthenticated(),
        isLoading,
        login,
        loginStudent,
        loginAdmin,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};