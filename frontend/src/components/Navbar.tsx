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
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-slate-950/85 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-8">
            <Link className="flex items-center space-x-2 text-primary font-bold text-lg" href="/">
              <Compass className="h-7 w-7 text-secondary animate-spin-slow" />
              <span className="bg-gradient-to-r from-secondary via-amber-300 to-secondary bg-clip-text text-transparent font-black tracking-wide">
                Explore World
              </span>
            </Link>

            {/* Central Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/packages"
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isActive('/packages') ? 'text-secondary' : 'text-slate-300 hover:text-white'
                }`}
              >
                Packages
              </Link>
              <Link
                href="/national-tours"
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isActive('/national-tours') ? 'text-secondary' : 'text-slate-300 hover:text-white'
                }`}
              >
                National Tours
              </Link>
              <Link
                href="/international-tours"
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isActive('/international-tours') ? 'text-secondary' : 'text-slate-300 hover:text-white'
                }`}
              >
                International Tours
              </Link>
              {(user?.role === 'GUIDE' || user?.role === 'TOUR_GUIDE') && (
                <Link
                  href="/guide"
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive('/guide') ? 'text-secondary' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Guide Dashboard
                </Link>
              )}
              {user?.role === 'USER' && (
                <Link
                  href="/dashboard"
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive('/dashboard') ? 'text-secondary' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  My Dashboard
                </Link>
              )}
              <button
                onClick={() => handleNavClick('#about-us')}
                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                About Us
              </button>
              <button
                onClick={() => handleNavClick('#contact-us')}
                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
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
              className="text-[10px] uppercase font-bold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900 transition-all duration-200"
            >
              Exit Portal
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-200"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-secondary" /> : <Moon className="h-5 w-5 text-primary" />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : (user.role === 'GUIDE' || user.role === 'TOUR_GUIDE') ? '/guide' : '/dashboard'}
                  className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-secondary transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-secondary" />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 rounded-xl border border-white/10 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="rounded-xl bg-gradient-to-r from-secondary to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow hover:brightness-110 transition-all duration-200"
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
