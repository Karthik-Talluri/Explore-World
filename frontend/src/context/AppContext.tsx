'useContext';
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface BookingDetails {
  type: 'FLIGHT' | 'HOTEL' | 'PACKAGE';
  details: any;
  totalPrice: number;
}

interface AppContextType {
  token: string | null;
  user: User | null;
  theme: 'light' | 'dark';
  activeBooking: BookingDetails | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  toggleTheme: () => void;
  setActiveBooking: (booking: BookingDetails | null) => void;
  apiUrl: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // dark mode by default for premium design
  const [activeBooking, setActiveBookingState] = useState<BookingDetails | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  // Load state on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('explore_token');
    const savedUser = localStorage.getItem('explore_user');
    const savedTheme = localStorage.getItem('explore_theme') as 'light' | 'dark';

    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
    
    // Theme preference check
    const currentTheme = savedTheme || 'dark';
    setTheme(currentTheme);
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('explore_token', newToken);
    localStorage.setItem('explore_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('explore_token');
    localStorage.removeItem('explore_user');
    setToken(null);
    setUser(null);
    setActiveBookingState(null);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('explore_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setActiveBooking = (booking: BookingDetails | null) => {
    setActiveBookingState(booking);
  };

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        theme,
        activeBooking,
        login,
        logout,
        toggleTheme,
        setActiveBooking,
        apiUrl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
