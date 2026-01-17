import { useNavigate } from 'react-router-dom';
import { User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-32 h-32 mb-6">
          <img 
            src="/images/logo.png" 
            alt="CNS Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground text-center mb-2">
          CNS Canteen
        </h1>
        <p className="text-muted-foreground text-center mb-12">
          Order your favorite food quickly and easily
        </p>

        <div className="w-full max-w-sm space-y-4">
          <Button
            onClick={() => navigate('/student/login')}
            className="w-full h-14 text-base font-semibold gap-3"
          >
            <User className="w-5 h-5" />
            Continue as Student
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/admin/login')}
            className="w-full h-14 text-base font-semibold gap-3"
          >
            <Shield className="w-5 h-5" />
            Canteen Staff Login
          </Button>
        </div>
      </div>

      <footer className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          CNS Canteen Management System
        </p>
      </footer>
    </div>
  );
};

export default Index;
