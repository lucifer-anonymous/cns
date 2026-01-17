import { Home, Utensils, ShoppingCart, User, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

const navItems = [
  { 
    icon: Home, 
    label: 'Home', 
    path: '/student',
    description: 'Browse menu and order food'
  },
  { 
    icon: Clock, 
    label: 'My Orders', 
    path: '/student/orders',
    description: 'Track your orders'
  },
  { 
    icon: ShoppingCart, 
    label: 'Cart', 
    path: '/student/cart',
    description: 'View your cart'
  },
  { 
    icon: User, 
    label: 'Profile', 
    path: '/student/profile',
    description: 'Account settings'
  },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/40 safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          const isCart = path === '/student/cart';

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Icon 
                    className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                  {isCart && totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className={`text-xs mt-1 ${isActive ? 'font-semibold text-primary' : 'font-medium text-muted-foreground'}`}>
                  {label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
