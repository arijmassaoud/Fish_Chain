// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import axios from 'axios'; // Assurez-vous d'avoir installé axios : npm install axios

// Define the shape of your user object
interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'BUYER' | 'VET';
}

// Define the shape of the context's value
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
  googleLogin: (accessToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Define logout and getAuthHeaders with useCallback before they are used in useEffect
  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
    return { 'Content-Type': 'application/json' };
  }, [token]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/auth/signin');
  }, [router]);

  // Effect to load token from localStorage on initial app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Effect to fetch the user's profile whenever the token changes
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: getAuthHeaders(),
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setUser(result.data);
            }
          } else {
            logout();
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
          logout();
        }
      } else {
        setUser(null);
      }
    };

    if (!loading) {
      fetchUser();
    }
  }, [token, loading, getAuthHeaders, logout]);


  // ✅ FIX: Full implementation for the login function
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      if (!data.token) {
        throw new Error('Token not provided by server');
      }
      localStorage.setItem('token', data.token);
      setToken(data.token); // This will trigger the useEffect to fetch the user
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // ✅ FIX: Full implementation for the register function
const register = async (name: string, email: string, password: string, role: string, profilePicture?: string) => {
  const response = await fetch(`fetch(${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, role, profilePicture }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Registration failed');

  localStorage.setItem('token', data.token);
  setUser(data.user);
};
 
const googleLogin = async (accessToken: string) => {
    const { data } = await axios.post(`${API_URL}/api/auth/google`, { token: accessToken });
    const { token: receivedToken, user: receivedUser } = data;
    
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('token', receivedToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
  };
   const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    getAuthHeaders,
     googleLogin
  
  };
  // Render children only after the initial token check is complete to avoid flashes of wrong content
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}