'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/useAppStore';
import { authAPI } from '@/lib/api';
interface AuthContextType {
  // Expose if needed, currently just for initialization
}

const AuthContext = createContext<AuthContextType>({});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { setAuth, logout, setLoading } = useAuthStore();

  useEffect(() => {
    // Check authentication on app load
    const checkAuth = async () => {
      try {
        const response = await authAPI.getMe();
        const { user } = response.data.data;
        
        // User is authenticated
        setAuth(user, useAuthStore.getState().accessToken || '');
      } catch (error) {
        // Not authenticated or token expired
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);