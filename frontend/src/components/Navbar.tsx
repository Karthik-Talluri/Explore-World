'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Compass, Sun, Moon, LogOut, User as UserIcon, LayoutDashboard, Palmtree } from 'lucide-react';
import { useState } from 'react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useApp();
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-45 w-full border-b border-border/40 bg-background/85 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-primary font-bold text-xl">
              <Compass className="h-6 w-6 text-secondary animate-spin-slow" />
              <span className="bg-gradient-to-r from-secondary via-amber-300 to-secondary bg-clip-text text-transparent font-extrabold tracking-wide">
                Explore World
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/packages"
              className={`text-sm font-semibold transition-colors duration-200 flex items-center space-x-1 ${
                isActive('/packages') ? 'text-secondary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Palmtree className="h-4 w-4" />
              <span>Tour Packages</span>
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-semibold transition-colors duration-200 ${
                isActive('/dashboard') ? 'text-secondary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              My Bookings
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`flex items-center space-x-1 text-sm font-bold text-secondary hover:brightness-110`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-secondary" /> : <Moon className="h-5 w-5 text-primary" />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground">
                  <UserIcon className="h-4 w-4 text-secondary" />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="rounded-xl bg-gradient-to-r from-secondary to-amber-600 px-5 py-2 text-xs font-bold text-slate-950 shadow hover:brightness-110 transition-all duration-200"
              >
                Sign In
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
}
