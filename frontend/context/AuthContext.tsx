'use client';
import {
  createContext, useContext, useState, useEffect, useMemo,} from 'react';
import type { User } from '@/types/User';
import { api } from '@/lib/api';
import { setAuthCookie, clearAuthCookie } from '@/lib/utils';
import { AUTH_STORAGE_KEY } from '@/lib/constants';

interface AuthContextType {
  user: User | null;       
  isLoading: boolean;  
  isLoggedIn: boolean;
  isVendor: boolean;
  login: (email: string, password: string) => Promise<void>;
  vendorLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
 
  useEffect(() => {
    // This runs once when the app first loads in the browser
    const token = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!token) {
      setIsLoading(false);
      return;
    }

    // Token exists — sync it to cookie for middleware and verify with backend
    setAuthCookie(token);

    api.get<User>('/api/auth/profile/')
      .then((userData) => setUser(userData))
      .catch(() => {
        // Token invalid or expired — clear everything
        localStorage.removeItem(AUTH_STORAGE_KEY);
        clearAuthCookie();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ─── User Login ────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<void> => {
    const data = await api.post<{ token: string; user: User }>(
      '/api/auth/login/',
      { email, password }
    );
    localStorage.setItem(AUTH_STORAGE_KEY, data.token);
    setAuthCookie(data.token);
    setUser({ ...data.user, role: 'user' });
  };

  // ─── Vendor Login ──────────────────────────────────────────────────
  const vendorLogin = async (email: string, password: string): Promise<void> => {
    const data = await api.post<{ token: string; vendor: User }>(
      '/api/auth/vendor-login/',
      { email, password }
    );
    localStorage.setItem(AUTH_STORAGE_KEY, data.token);
    setAuthCookie(data.token);
    setUser({ ...data.vendor, role: 'vendor' });
  };

  // ─── Logout ────────────────────────────────────────────────────────
  const logout = (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    clearAuthCookie();
    setUser(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isLoggedIn: !!user,
      isVendor: user?.role === 'vendor',
      login,
      vendorLogin,
      logout,
    }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}