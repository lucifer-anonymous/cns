// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// WebSocket Configuration
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
export const WS_ENABLED = true;

// Other configuration constants
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

// Feature flags
export const FEATURES = {
  REAL_TIME_UPDATES: true,
  MENU_CATEGORIES: true,
  CART_FUNCTIONALITY: true,
};
