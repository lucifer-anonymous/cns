import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, MenuItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize cart from localStorage
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        console.log('💾 Loaded cart from localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
      console.log('💾 Saved cart to localStorage:', items.length, 'items');
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items]);

  const getItemId = (item: MenuItem | CartItem): string => {
    return item._id || item.id || '';
  };

  const addItem = (item: MenuItem) => {
    console.log('🛒 Adding item to cart:', item);
    console.log('🆔 Item ID:', getItemId(item));
    
    setItems((prev) => {
      const itemId = getItemId(item);
      const existing = prev.find((i) => getItemId(i) === itemId);
      
      console.log('📦 Existing item in cart?', existing);
      console.log('📋 Current cart items:', prev.length);
      
      if (existing) {
        const updated = prev.map((i) =>
          getItemId(i) === itemId ? { ...i, quantity: i.quantity + 1 } : i
        );
        console.log('✅ Updated cart items:', updated.length);
        return updated;
      }
      
      const newCart = [...prev, { ...item, id: itemId, _id: itemId, quantity: 1 }];
      console.log('✅ New cart items:', newCart.length);
      return newCart;
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => getItemId(i) !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (getItemId(i) === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const getItemQuantity = (itemId: string) => {
    return items.find((i) => getItemId(i) === itemId)?.quantity || 0;
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
