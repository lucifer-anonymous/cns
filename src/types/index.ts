export interface Category {
  _id: string;
  name: string;
  slug: string;
  sortOrder?: number;
}

export interface MenuItem {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  category: string | { _id: string; name: string; slug: string }; // Can be ID string or populated object
  imageUrl?: string;
  image?: string; // For backward compatibility
  isAvailable?: boolean;
  available?: boolean; // For backward compatibility
  description?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderItem {
  menuItem: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  _id?: string;
  id?: string;
  user?: string;
  studentId?: string;
  studentName?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: 'placed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  notes?: string;
  paymentMode?: 'cash';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Student {
  id: string;
  name: string;
  registrationNumber: string;
  mobile: string;
}

export type UserRole = 'student' | 'admin';
