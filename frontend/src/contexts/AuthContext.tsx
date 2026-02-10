'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  profilePicture?: string | null;
  authProvider?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  // Google authentication
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; message: string; user?: User }>;
  // Common
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      verifySession(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Sync axios default Authorization header with auth state
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && user) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  const verifySession = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/social-auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.id) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser({
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          profilePicture: response.data.profilePicture,
          authProvider: response.data.authProvider,
        });
        return;
      }
    } catch {
      // Session invalid
    }

    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setIsLoading(false);
  };

  // After verifySession sets user or fails
  useEffect(() => {
    if (user !== null) {
      setIsLoading(false);
    }
  }, [user]);

  // Google authentication
  const loginWithGoogle = async (credential: string): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const response = await axios.post(`${API_URL}/social-auth/google/verify`, { credential });

      if (response.data.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        const googleUser: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          profilePicture: response.data.user.profilePicture,
          authProvider: 'google',
        };
        setUser(googleUser);
        return { success: true, message: 'Login successful', user: googleUser };
      }

      return { success: false, message: response.data.message || response.data.error || 'Google login failed' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || 'Google login failed',
      };
    }
  };

  const logout = async () => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isGuest: !user,
        isLoading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
