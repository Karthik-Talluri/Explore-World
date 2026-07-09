'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Compass, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleNavClick = (sectionId: string) => {
    if (pathname !== '/') {
      router.push(`/${sectionId}`);
    } else {
      const el = document.getElementById(sectionId.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleExitPortal = () => {
    sessionStorage.removeItem('explore_world_role');
    window.dispatchEvent(new Event('explore-world-role-changed'));
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-8">
            <Link className="flex items-center space-x-2 font-bold text-lg" href="/">
              <Compass className="h-6 w-6 text-amber-500 animate-spin-slow" />
              <span className="bg-gradient-to-r from-slate-900 to-slate-750 bg-clip-text text-transparent font-black tracking-tight text-md">
                Explore World
              </span>
            </Link>

            {/* Central Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/packages"
                className={`text-[13px] font-semibold tracking-wide transition-colors duration-250 ${
                  isActive('/packages') ? 'text-amber-500' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Packages
              </Link>
              <Link
                href="/national-tours"
                className={`text-[13px] font-semibold tracking-wide transition-colors duration-250 ${
                  isActive('/national-tours') ? 'text-amber-500' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                National Tours
              </Link>
              <Link
                href="/international-tours"
                className={`text-[13px] font-semibold tracking-wide transition-colors duration-250 ${
                  isActive('/international-tours') ? 'text-amber-500' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                International Tours
              </Link>
              {(user?.role === 'GUIDE' || user?.role === 'TOUR_GUIDE') && (
                <Link
                  href="/guide"
                  className={`text-[13px] font-semibold tracking-wide transition-colors duration-250 ${
                    isActive('/guide') ? 'text-amber-500' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Guide Dashboard
                </Link>
              )}
              {user?.role === 'USER' && (
                <Link
                  href="/dashboard"
                  className={`text-[13px] font-semibold tracking-wide transition-colors duration-250 ${
                    isActive('/dashboard') ? 'text-amber-500' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  My Dashboard
                </Link>
              )}
              <button
                onClick={() => handleNavClick('#about-us')}
                className="text-[13px] font-semibold tracking-wide text-slate-600 hover:text-slate-950 transition-colors"
              >
                About Us
              </button>
              <button
                onClick={() => handleNavClick('#contact-us')}
                className="text-[13px] font-semibold tracking-wide text-slate-600 hover:text-slate-950 transition-colors"
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center space-x-4">
            {/* Exit Portal Button */}
            <button
              onClick={handleExitPortal}
              className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all duration-200"
            >
              Exit Portal
            </button>

            {/* Theme Toggle (Hidden or subtle since Traveller is light only) */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-200"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-slate-700" />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : (user.role === 'GUIDE' || user.role === 'TOUR_GUIDE') ? '/guide' : '/dashboard'}
                  className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-amber-500 transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-amber-500" />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 rounded-xl border border-rose-200 px-3.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 transition-all duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="rounded-xl bg-slate-950 hover:bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
}
