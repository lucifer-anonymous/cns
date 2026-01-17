import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { studentRegister, studentVerify } from '@/services/student';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const StudentRegister = () => {
  const navigate = useNavigate();
  const { loginStudent } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  
  const [formData, setFormData] = useState({
    name: '',
    registrationNo: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [otpData, setOtpData] = useState({
    otp: '',
    registrationNo: ''
  });

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.registrationNo.trim() || 
        !formData.email.trim() || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔐 Starting registration with:', {
        name: formData.name,
        registrationNo: formData.registrationNo,
        email: formData.email
      });
      
      const response = await studentRegister({
        name: formData.name.trim(),
        registrationNo: formData.registrationNo.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      
      console.log('✅ Registration response:', response);
      
      if (response.success) {
        toast.success('OTP sent to your email! Please check your inbox.');
        setOtpData({
          otp: '',
          registrationNo: formData.registrationNo.trim()
        });
        setStep('verify');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      toast.error(error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpData.otp || otpData.otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔐 Verifying OTP for:', otpData.registrationNo);
      
      const response = await studentVerify({
        registrationNo: otpData.registrationNo,
        otp: otpData.otp
      });
      
      console.log('✅ Verification response:', response);
      
      if (response.success && response.data && response.token) {
        const userData = {
          id: response.data._id || '',
          name: response.data.name || 'User',
          email: response.data.email || '',
          registrationNo: response.data.registrationNo || otpData.registrationNo,
          registrationNumber: response.data.registrationNo || otpData.registrationNo,
          mobile: response.data.mobile || '',
          role: response.data.role || 'student',
          isVerified: response.data.isVerified !== undefined ? response.data.isVerified : true,
          token: response.token
        };
        
        console.log('👤 Logging in user:', userData);
        loginStudent(userData);
        
        toast.success('Account verified successfully!');
        navigate('/student');
      } else {
        throw new Error(response.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('❌ Verification error:', error);
      toast.error(error.message || 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const response = await studentRegister({
        name: formData.name.trim(),
        registrationNo: formData.registrationNo.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      
      if (response.success) {
        toast.success('OTP resent to your email!');
      } else {
        throw new Error(response.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      console.error('❌ Resend OTP error:', error);
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary min-h-[320px] rounded-b-[2rem] relative flex items-center justify-center pb-4">
        <button
          onClick={() => step === 'register' ? navigate('/student/login') : setStep('register')}
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
          <p className="text-sm text-primary-foreground/90">
            {step === 'register' ? 'Student Registration' : 'Verify Your Email'}
          </p>
        </div>
      </div>

      <div className="flex-1 p-6 -mt-4">
        <div className="bg-card rounded-2xl shadow-lg p-6 max-w-md mx-auto w-full">
          {step === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
              
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password (min 6 characters)"
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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
                  </button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : 'Create Account'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit OTP to your email address.
                  Please enter it below to verify your account.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otpData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtpData({...otpData, otp: value});
                  }}
                  required
                  disabled={isLoading}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : 'Verify Account'}
              </Button>
              
              <div className="text-center text-sm">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <button 
              type="button" 
              className="text-primary hover:underline font-medium"
              onClick={() => navigate('/student/login')}
              disabled={isLoading}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
