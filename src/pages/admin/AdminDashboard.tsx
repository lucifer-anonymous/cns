import { useEffect } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { OrderCard } from '@/components/admin/OrderCard';
import { ClipboardList, TrendingUp, DollarSign } from 'lucide-react';

export function AdminDashboard() {
  const { getPendingOrders, getTodayOrders, getTodayTotal, fetchAdminOrders } = useOrders();

  useEffect(() => {
    fetchAdminOrders();
    // Poll for new orders every 10 seconds
    const interval = setInterval(fetchAdminOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchAdminOrders]);

  const pendingOrders = getPendingOrders();
  const todayOrders = getTodayOrders();
  const todayTotal = getTodayTotal();

  const stats = [
    { icon: ClipboardList, label: 'Active Orders', value: pendingOrders.length, color: 'text-primary' },
    { icon: TrendingUp, label: 'Today Orders', value: todayOrders.length, color: 'text-success' },
    { icon: DollarSign, label: 'Today Sales', value: `₹${todayTotal}`, color: 'text-warning' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="md:ml-64 pb-24 md:pb-8">
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-card rounded-lg card-shadow p-4">
                <Icon className={`w-6 h-6 ${color} mb-2`} />
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <h2 className="font-semibold text-foreground mb-4">Active Orders</h2>

          {pendingOrders.length === 0 ? (
            <div className="bg-card rounded-lg card-shadow p-8 text-center">
              <p className="text-muted-foreground">No active orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AdminMobileNav />
    </div>
  );
}
