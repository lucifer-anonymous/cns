import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authService.login({
        username: formData.username.trim(),
        password: formData.password
      });
      
      if (response.success && response.data && response.token) {
        // Verify user is admin or staff
        if (response.data.role !== 'admin' && response.data.role !== 'staff') {
          toast.error('Access denied. This login is for admin and staff only.');
          return;
        }

        // Login via auth context using loginAdmin
        await loginAdmin({
          id: response.data._id || response.data.id,
          name: response.data.name,
          email: response.data.email,
          username: response.data.username,
          role: response.data.role,
          token: response.token
        });
        
        toast.success('Login successful');
        navigate('/admin');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
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
          <p className="text-sm text-primary-foreground/90">Admin Login</p>
        </div>
      </div>

      <div className="flex-1 p-6 -mt-4">
        <div className="bg-card rounded-2xl shadow-lg p-6 max-w-md mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
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

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Admin and staff access only</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/student/login')}
          className="w-full text-center text-muted-foreground text-sm mt-6"
        >
          Student? <span className="text-primary font-medium">Login here</span>
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
