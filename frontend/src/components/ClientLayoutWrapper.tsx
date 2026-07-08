'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user } = useApp();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = () => {
      setSelectedRole(sessionStorage.getItem('explore_world_role'));
    };
    checkRole();
    
    // Listen for storage changes in the same or other tabs
    window.addEventListener('storage', checkRole);
    window.addEventListener('explore-world-role-changed', checkRole);
    
    return () => {
      window.removeEventListener('storage', checkRole);
      window.removeEventListener('explore-world-role-changed', checkRole);
    };
  }, []);

  // Root route acts as a portal (hiding public layout) if role is not selected
  const isPortal = (pathname === '/' && selectedRole !== 'traveller') ||
                   pathname === '/guide' || 
                   pathname.startsWith('/guide/') || 
                   pathname.startsWith('/admin');

  useEffect(() => {
    if (token && user) {
      const isGuideRoute = pathname === '/guide' || pathname.startsWith('/guide/');
      
      // 1. Guide users must never see traveller pages after login
      if ((user.role === 'GUIDE' || user.role === 'TOUR_GUIDE') && !isGuideRoute) {
        router.push('/guide');
      }
      
      // 2. Traveller users must never access guide pages
      if (user.role !== 'GUIDE' && user.role !== 'TOUR_GUIDE' && isGuideRoute) {
        if (user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [token, user, pathname]);

  if (isPortal) {
    return (
      <main className="flex-grow flex flex-col min-h-screen bg-slate-950 text-white">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
    </>
  );
}
