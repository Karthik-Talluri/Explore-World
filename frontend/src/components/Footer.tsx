import Link from 'next/link';
import { Compass, Globe, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/50 backdrop-blur-md py-12 transition-colors duration-300 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & About */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-primary font-bold text-lg">
              <Compass className="h-5 w-5 text-secondary" />
              <span className="tracking-wide">Explore World</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your gateway to premium travel packages, luxury accommodations, and seamless flight bookings worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Quick Explore</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/flights" className="text-muted-foreground hover:text-primary transition-colors">
                  Find Flights
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="text-muted-foreground hover:text-primary transition-colors">
                  Browse Hotels
                </Link>
              </li>
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Holiday Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Support & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-muted-foreground hover:text-primary cursor-pointer transition-colors flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Travel Insurance</span>
                </span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-primary cursor-pointer transition-colors flex items-center space-x-1">
                  <Globe className="h-3 w-3" />
                  <span>Visa Information</span>
                </span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Copyright / Custom */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Join Newsletter</h4>
            <div className="flex">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-l-xl border border-input bg-background/50 px-3 py-1.5 text-xs text-foreground focus:outline-none"
              />
              <button className="rounded-r-xl bg-primary px-3 text-xs font-semibold text-primary-foreground hover:brightness-110">
                Go
              </button>
            </div>
          </div>

        </div>

        <div className="border-t border-border/40 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Explore World Inc. All rights reserved.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Crafted with <Heart className="h-3.5 w-3.5 text-destructive mx-1 fill-destructive" /> for travelers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
