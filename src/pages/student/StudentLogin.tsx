import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { studentLogin } from '@/services/student';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const StudentLogin = () => {
  const navigate = useNavigate();
  const { loginStudent } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    registrationNo: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.registrationNo.trim() || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔐 Starting login with:', {
        registrationNo: formData.registrationNo.trim(),
        passwordLength: formData.password.length
      });
      
      const response = await studentLogin({
        registrationNo: formData.registrationNo.trim(),
        password: formData.password
      });
      
      console.log('✅ Login API response received:', response);
      
      if (response.success && response.data) {
        console.log('📝 Login response data:', response);
        console.log('🔑 Token from response:', response.token);
        
        if (!response.token) {
          console.error('❌ NO TOKEN IN RESPONSE!');
          throw new Error('No authentication token received from server');
        }
        
        const userData = {
          id: response.data._id || '',
          name: response.data.name || 'User',
          email: response.data.email || '',
          registrationNo: response.data.registrationNo || formData.registrationNo.trim(),
          registrationNumber: response.data.registrationNo || formData.registrationNo.trim(),
          mobile: response.data.mobile || '',
          role: response.data.role || 'student',
          isVerified: response.data.isVerified !== undefined ? response.data.isVerified : true,
          token: response.token
        };
        
        console.log('👤 Calling loginStudent with userData:', userData);
        loginStudent(userData);
        
        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        console.log('🔍 Token verification after loginStudent:', storedToken ? 'STORED' : 'NOT STORED');
        
        toast.success('Login successful');
        navigate('/student');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      toast.error(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary min-h-[320px] rounded-b-[2rem] relative flex items-center justify-center pb-4">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-4 p-2 bg-primary-foreground/20 rounded-full"
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5 text-primary-foreground" />
        </button>
        <div className="w-full text-center px-6 py-6">
          <div className="mx-auto mb-3 flex items-center justify-center">
            <img 
              src="/images/logowhite.png" 
              alt="CNS Logo" 
              className="w-40 h-40 object-contain drop-shadow-lg"
            />
          </div>
          <p className="text-base text-primary-foreground/90 font-medium">Canteen Network Simplifier</p>
          <p className="text-sm text-primary-foreground/90">Student Login</p>
        </div>
      </div>

      <div className="flex-1 p-6 -mt-4">
        <div className="bg-card rounded-2xl shadow-lg p-6 max-w-md mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="registrationNo">Registration Number</Label>
              <Input
                id="registrationNo"
                type="text"
                placeholder="Enter your registration number"
                value={formData.registrationNo}
                onChange={(e) => setFormData({...formData, registrationNo: e.target.value})}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button 
                  type="button" 
                  className="text-sm text-primary hover:underline"
                  onClick={() => {/* TODO: Implement forgot password */}}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <button 
              type="button" 
              className="text-primary hover:underline font-medium"
              onClick={() => navigate('/student/register')}
              disabled={isLoading}
            >
              Sign up
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate('/admin/login')}
          className="w-full text-center text-muted-foreground text-sm mt-6"
        >
          Canteen Staff? <span className="text-primary font-medium">Login here</span>
        </button>
      </div>
    </div>
  );
};

export default StudentLogin;
