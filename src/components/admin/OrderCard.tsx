import { Order } from '@/types';
import { OrderStatusBadge } from '@/components/student/OrderStatusBadge';
import { useOrders } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { Clock, User, Banknote } from 'lucide-react';

interface OrderCardProps {
  order: Order;
}

const statusActions: Record<Order['status'], { next: Order['status'] | null; label: string } | null> = {
  placed: { next: 'preparing', label: 'Accept' },
  preparing: { next: 'ready', label: 'Mark Ready' },
  ready: { next: 'served', label: 'Complete' },
  served: null,
  cancelled: null,
};

export function OrderCard({ order }: OrderCardProps) {
  const { updateOrderStatus } = useOrders();
  const action = statusActions[order.status];

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const orderId = order._id || order.id || '';
  
  return (
    <div className="bg-card rounded-lg card-shadow p-4 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-foreground">Order #{orderId.slice(-6)}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <User className="w-4 h-4" />
            <span>Customer</span>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="space-y-2 py-3 border-y border-border">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-foreground">
              {item.qty}x {item.name}
            </span>
            <span className="text-muted-foreground">₹{(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Banknote className="w-4 h-4 text-success" />
            <span className="font-bold text-foreground">₹{order.total.toFixed(2)}</span>
            <span className="text-muted-foreground">(Cash)</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatTime(order.createdAt)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {order.status === 'placed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateOrderStatus(orderId, 'cancelled')}
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Cancel
            </Button>
          )}
          {action && (
            <Button
              size="sm"
              onClick={() => updateOrderStatus(orderId, action.next!)}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
