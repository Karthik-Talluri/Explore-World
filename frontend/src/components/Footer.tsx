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
              <span className="text-gold-gradient font-bold tracking-wide">Explore World</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We specialize in offering high-end, luxury tour packages across 26 Indian States and 32 global international countries. Explore the world in style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Holiday Deals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/packages?category=national" className="text-muted-foreground hover:text-secondary transition-colors">
                  National Packages
                </Link>
              </li>
              <li>
                <Link href="/packages?category=international" className="text-muted-foreground hover:text-secondary transition-colors">
                  International Packages
                </Link>
              </li>
              <li>
                <Link href="/packages?type=Honeymoon" className="text-muted-foreground hover:text-secondary transition-colors">
                  Honeymoon Getaways
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Legal & Safe</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-muted-foreground hover:text-secondary cursor-pointer transition-colors flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Travel Protection</span>
                </span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-secondary cursor-pointer transition-colors flex items-center space-x-1">
                  <Globe className="h-3 w-3" />
                  <span>Customs Guides</span>
                </span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-secondary cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>

          {/* Subscribe */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Subscribe to Luxury</h4>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full rounded-l-xl border border-input bg-background/50 px-3 py-1.5 text-xs text-foreground focus:outline-none"
              />
              <button className="rounded-r-xl bg-secondary px-3.5 text-xs font-bold text-slate-950 hover:brightness-110">
                Join
              </button>
            </div>
          </div>

        </div>

        <div className="border-t border-border/40 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Explore World Inc. All rights reserved.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Crafted with <Heart className="h-3.5 w-3.5 text-secondary mx-1 fill-secondary" /> for luxury travellers.
          </p>
        </div>
      </div>
    </footer>
  );
}
