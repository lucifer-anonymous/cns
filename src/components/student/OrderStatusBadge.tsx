import { Order } from '@/types';

interface OrderStatusBadgeProps {
  status: Order['status'];
}

const statusConfig: Record<Order['status'], { label: string; className: string }> = {
  placed: { label: 'Placed', className: 'bg-warning/10 text-warning' },
  preparing: { label: 'Preparing', className: 'bg-primary/10 text-primary' },
  ready: { label: 'Ready', className: 'bg-success/10 text-success' },
  served: { label: 'Served', className: 'bg-success/10 text-success' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
