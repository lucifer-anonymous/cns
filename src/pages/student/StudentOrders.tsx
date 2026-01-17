import { useState, useEffect } from 'react';
import { ArrowLeft, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/contexts/OrderContext';
import { BottomNav } from '@/components/student/BottomNav';
import { OrderStatusBadge } from '@/components/student/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';

function CancelButton({ order }: { order: Order }) {
  const { cancelOrder, canCancelOrder, getCancellationTimeLeft } = useOrders();
  const [timeLeft, setTimeLeft] = useState(getCancellationTimeLeft(order));

  useEffect(() => {
    if (!canCancelOrder(order)) return;

    const interval = setInterval(() => {
      const remaining = getCancellationTimeLeft(order);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order, canCancelOrder, getCancellationTimeLeft]);

  if (!canCancelOrder(order) || timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Cancel within {minutes}:{seconds.toString().padStart(2, '0')}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => cancelOrder(order._id || order.id || '')}
        className="ml-auto text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
      >
        <X className="w-4 h-4 mr-1" />
        Cancel
      </Button>
    </div>
  );
}

export function StudentOrders() {
  const navigate = useNavigate();
  const { orders, fetchOrders } = useOrders();

  useEffect(() => {
    fetchOrders();
    // Poll for order updates every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          <h1 className="text-2xl font-bold text-foreground">Order History</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderId = order._id || order.id || '';
              return (
                <div
                  key={orderId}
                  className="bg-card rounded-lg card-shadow p-4 animate-fade-in"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">Order #{orderId.slice(-6)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)} {formatTime(order.createdAt)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div className="space-y-2 py-3 border-b border-border">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-foreground">
                          <span className="text-muted-foreground">{item.qty}x</span>{' '}
                          {item.name}
                        </span>
                        <span className="text-muted-foreground">
                          ₹{(item.price * item.qty).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-3">
                    <span className="text-muted-foreground">Item Total:</span>
                    <span className="font-bold text-foreground">₹{order.total.toFixed(0)}</span>
                  </div>

                  <CancelButton order={order} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
