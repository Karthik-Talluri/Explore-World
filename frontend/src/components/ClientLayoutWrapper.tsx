'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user } = useApp();

  const isPortal = pathname.startsWith('/guide-dashboard') || 
                   pathname.startsWith('/guide-login') || 
                   pathname.startsWith('/admin');

  useEffect(() => {
    if (token && user) {
      const isGuideRoute = pathname.startsWith('/guide-dashboard') || pathname.startsWith('/guide-login');
      
      // 1. Guide users must never see traveller pages after login
      if (user.role === 'GUIDE' && !isGuideRoute) {
        router.push('/guide-dashboard');
      }
      
      // 2. Traveller users must never access guide pages
      if (user.role !== 'GUIDE' && pathname.startsWith('/guide-dashboard')) {
        router.push('/dashboard');
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
