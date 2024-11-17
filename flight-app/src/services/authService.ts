'use client'

import axiosInstance from './axiosConfig';

export interface User {
  username: string;
  role: string;
  permissions: string[];
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

// Helper function to safely access localStorage
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      const storage = getLocalStorage();
      // Store user data in localStorage
      if (response.data.token && storage) {
        storage.setItem('token', response.data.token);
        storage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: (): User | null => {
    const storage = getLocalStorage();
    if (!storage) return null;
    
    const userStr = storage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  hasPermission: (permission: string): boolean => {
    const user = authService.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  },

  logout: () => {
    const storage = getLocalStorage();
    if (!storage) return;
    
    // Clear all auth-related items from localStorage
    storage.removeItem('token');
    storage.removeItem('user');
    storage.removeItem('userRole');
  }
}; 