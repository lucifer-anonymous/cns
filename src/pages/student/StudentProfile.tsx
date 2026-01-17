import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Hash, LogOut, ChevronRight, Mail, IdCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/student/BottomNav';
import { Button } from '@/components/ui/button';

export function StudentProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const profileItems = [
    { icon: User, label: 'Name', value: user?.name || 'Student' },
    { icon: Hash, label: 'Registration Number', value: user?.registrationNo || user?.registrationNumber || 'N/A' },
    { icon: IdCard, label: 'User ID', value: user?.id || 'N/A' },
    ...(user?.email ? [{ icon: Mail, label: 'Email', value: user.email }] : []),
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/student')}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{user?.name || 'Student'}</h2>
          <p className="text-muted-foreground">{user?.registrationNo || user?.registrationNumber || 'Registration Number'}</p>
        </div>

        <div className="bg-card rounded-lg card-shadow divide-y divide-border mb-6">
          {profileItems.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground">{value}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
