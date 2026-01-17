import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { useOrders } from '@/contexts/OrderContext';
import { OrderStatusBadge } from '@/components/student/OrderStatusBadge';
import { Banknote, Receipt, TrendingUp, XCircle } from 'lucide-react';

export function AdminSales() {
  const { orders, fetchAdminOrders, getTodayOrders, getTodayTotal } = useOrders();
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'all'>('today');

  useEffect(() => {
    fetchAdminOrders();
  }, [fetchAdminOrders]);

  const getFilteredOrders = () => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      switch (timeFilter) {
        case 'today':
          return orderDate >= today;
        case 'week':
          return orderDate >= weekAgo;
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();
  const completedOrders = filteredOrders.filter(order => order.status === 'served');
  const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled');
  
  const todayTotal = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = completedOrders.length > 0 ? todayTotal / completedOrders.length : 0;

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="md:ml-64 pb-24 md:pb-8">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Sales & Analytics</h1>
            
            <div className="flex gap-2">
              {(['today', 'week', 'all'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === filter
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg card-shadow p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-success" />
                </div>
                <span className="text-muted-foreground text-sm">Revenue</span>
              </div>
              <p className="text-2xl font-bold text-foreground">₹{todayTotal.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1">From completed</p>
            </div>
            
            <div className="bg-card rounded-lg card-shadow p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <span className="text-muted-foreground text-sm">Total Orders</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{filteredOrders.length}</p>
              <p className="text-xs text-muted-foreground mt-1">{completedOrders.length} completed</p>
            </div>

            <div className="bg-card rounded-lg card-shadow p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <span className="text-muted-foreground text-sm">Avg Order</span>
              </div>
              <p className="text-2xl font-bold text-foreground">₹{avgOrderValue.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Per order</p>
            </div>

            <div className="bg-card rounded-lg card-shadow p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <span className="text-muted-foreground text-sm">Cancelled</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{cancelledOrders.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Orders</p>
            </div>
          </div>

          <h2 className="font-semibold text-foreground mb-4">Order History</h2>

          {filteredOrders.length === 0 ? (
            <div className="bg-card rounded-lg card-shadow p-8 text-center">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const orderId = order._id || order.id || '';
                return (
                  <div
                    key={orderId}
                    className="bg-card rounded-lg card-shadow p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-foreground">Order #{orderId.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(order.createdAt)}
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <div className="space-y-1 text-sm">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {item.qty}x {item.name}
                          </span>
                          <span className="text-foreground">
                            ₹{(item.price * item.qty).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between mt-3 pt-3 border-t border-border">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-bold text-primary">₹{order.total.toFixed(0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AdminMobileNav />
    </div>
  );
}
