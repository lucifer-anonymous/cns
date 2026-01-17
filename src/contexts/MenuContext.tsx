import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { MenuItem } from '../types';
import { getAuthToken } from '../lib/auth';
import { WS_URL, WS_ENABLED } from '../config';
import { connectSocket, disconnectSocket } from '../lib/socket';
import api from '../lib/api';

interface MenuContextType {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  getItemsByCategory: (category: string) => MenuItem[];
  refreshMenu: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch menu items from API
  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/menu');
      
      // Handle the API response structure
      const responseData = response.data?.data || response.data || [];
      
      // Normalize the data structure
      const normalizedItems = (Array.isArray(responseData) ? responseData : []).map((item: any) => ({
        ...item,
        id: item._id || item.id,
        available: item.isAvailable !== undefined ? item.isAvailable : item.available,
        image: item.imageUrl || item.image || '/placeholder-food.jpg'
      }));
      
      setMenuItems(normalizedItems);
      setError(null);
      
      // Log the fetched items for debugging
      console.log('Fetched menu items:', normalizedItems);
      
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to load menu. Please try again later.');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize WebSocket connection and set up event listeners
  useEffect(() => {
    // Initial fetch
    fetchMenuItems();
    
    const token = getAuthToken();
    if (token && WS_ENABLED) {
      try {
        const socket = connectSocket(token);
        setSocket(socket);

        // Listen for menu updates
        socket.on('menu:update', (updatedMenu: MenuItem[]) => {
          console.log('Received menu update:', updatedMenu);
          setMenuItems(updatedMenu || []);
        });

        return () => {
          socket.off('menu:update');
          disconnectSocket();
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
        // Fall back to polling if WebSocket fails
        const interval = setInterval(fetchMenuItems, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
      }
    }
  }, [fetchMenuItems]);

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      // Transform frontend data to backend format
      const backendItem = {
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl || item.image,
        category: item.category,
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : item.available,
        tags: item.tags || []
      };
      
      await api.post('/api/v1/admin/menu', backendItem);
      // Refresh menu after adding
      await fetchMenuItems();
    } catch (err) {
      console.error('Error adding menu item:', err);
      throw err;
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      // Transform frontend data to backend format
      const backendUpdates: any = {};
      if (updates.name !== undefined) backendUpdates.name = updates.name;
      if (updates.description !== undefined) backendUpdates.description = updates.description;
      if (updates.price !== undefined) backendUpdates.price = updates.price;
      if (updates.imageUrl !== undefined || updates.image !== undefined) {
        backendUpdates.imageUrl = updates.imageUrl || updates.image;
      }
      if (updates.category !== undefined) backendUpdates.category = updates.category;
      if (updates.isAvailable !== undefined || updates.available !== undefined) {
        backendUpdates.isAvailable = updates.isAvailable !== undefined ? updates.isAvailable : updates.available;
      }
      if (updates.tags !== undefined) backendUpdates.tags = updates.tags;
      
      await api.patch(`/api/v1/admin/menu/${id}`, backendUpdates);
      // Refresh menu after updating
      await fetchMenuItems();
    } catch (err) {
      console.error('Error updating menu item:', err);
      throw err;
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      await api.delete(`/api/v1/admin/menu/${id}`);
      // Refresh menu after deleting
      await fetchMenuItems();
    } catch (err) {
      console.error('Error deleting menu item:', err);
      throw err;
    }
  };

  const toggleAvailability = async (id: string) => {
    try {
      const item = menuItems.find(item => (item.id || item._id) === id);
      if (!item) return;

      const currentAvailability = item.isAvailable !== undefined ? item.isAvailable : item.available;
      await updateMenuItem(id, { isAvailable: !currentAvailability });
    } catch (err) {
      console.error('Error toggling menu item availability:', err);
      throw err;
    }
  };

  const getItemsByCategory = (category: string) => {
    return menuItems.filter((item) => {
      if (typeof item.category === 'string') {
        return item.category === category;
      }
      return item.category._id === category || item.category.slug === category || item.category.name === category;
    });
  };

  const refreshMenu = useCallback(async () => {
    await fetchMenuItems();
  }, [fetchMenuItems]);

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        loading,
        error,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleAvailability,
        getItemsByCategory,
        refreshMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
