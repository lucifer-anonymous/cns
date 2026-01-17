import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react';
import { Order } from '@/types';
import { toast } from 'sonner';
import api from '@/lib/api';

const CANCELLATION_WINDOW_MS = 90 * 1000; // 90 seconds

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  placeOrder: (cartItems: any[], notes?: string) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  canCancelOrder: (order: Order) => boolean;
  getCancellationTimeLeft: (order: Order) => number;
  fetchOrders: () => Promise<void>;
  fetchAdminOrders: () => Promise<void>;
  getPendingOrders: () => Order[];
  getTodayOrders: () => Order[];
  getTodayTotal: () => number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch student's orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/orders');
      const ordersData = response.data?.data || [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all orders (admin)
  const fetchAdminOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/orders');
      const ordersData = response.data?.data || [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Place order from cart
  const placeOrder = async (cartItems: any[], notes?: string): Promise<Order | null> => {
    try {
      console.log('📦 Placing order with items:', cartItems);
      const response = await api.post('/api/v1/orders', { items: cartItems, notes });
      if (response.data?.success) {
        const newOrder = response.data.data;
        setOrders((prev) => [newOrder, ...prev]);
        toast.success('Order placed successfully! 🎉');
        return newOrder;
      }
      return null;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
      console.error('Error placing order:', error);
      return null;
    }
  };

  // Update order status (admin)
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await api.patch(`/api/v1/admin/orders/${orderId}/status`, { status });
      if (response.data?.success) {
        setOrders((prev) =>
          prev.map((o) =>
            (o._id || o.id) === orderId
              ? { ...o, status, updatedAt: new Date().toISOString() }
              : o
          )
        );

        // Toast notification for status change
        const statusMessages: Record<Order['status'], string> = {
          placed: 'Order is placed',
          preparing: 'Order is being prepared! 🍳',
          ready: 'Order is ready for pickup! 🎉',
          served: 'Order completed. Thank you!',
          cancelled: 'Order has been cancelled',
        };
        
        toast.success(statusMessages[status]);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update order status';
      toast.error(message);
      console.error('Error updating order status:', error);
    }
  };

  const canCancelOrder = useCallback((order: Order): boolean => {
    if (order.status !== 'placed') return false;
    const elapsed = Date.now() - new Date(order.createdAt).getTime();
    return elapsed < CANCELLATION_WINDOW_MS;
  }, []);

  const getCancellationTimeLeft = useCallback((order: Order): number => {
    if (order.status !== 'placed') return 0;
    const elapsed = Date.now() - new Date(order.createdAt).getTime();
    return Math.max(0, CANCELLATION_WINDOW_MS - elapsed);
  }, []);

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    const order = orders.find(o => (o._id || o.id) === orderId);
    if (!order || !canCancelOrder(order)) {
      toast.error('Cannot cancel order', {
        description: 'Cancellation window has expired',
      });
      return false;
    }

    try {
      const response = await api.patch(`/api/v1/orders/${orderId}/cancel`);
      if (response.data?.success) {
        setOrders((prev) =>
          prev.map((o) =>
            (o._id || o.id) === orderId
              ? { ...o, status: 'cancelled', updatedAt: new Date().toISOString() }
              : o
          )
        );

        toast.success('Order cancelled', {
          description: 'Your order has been cancelled successfully',
        });
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cancel order';
      toast.error(message);
      return false;
    }
  };

  const getPendingOrders = () => {
    return orders.filter((order) => 
      order.status === 'placed' || order.status === 'preparing' || order.status === 'ready'
    );
  };

  const getTodayOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders.filter((order) => new Date(order.createdAt) >= today);
  };

  const getTodayTotal = () => {
    return getTodayOrders()
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        placeOrder,
        updateOrderStatus,
        cancelOrder,
        canCancelOrder,
        getCancellationTimeLeft,
        fetchOrders,
        fetchAdminOrders,
        getPendingOrders,
        getTodayOrders,
        getTodayTotal,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
