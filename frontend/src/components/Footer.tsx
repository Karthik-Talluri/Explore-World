import Link from 'next/link';
import { Compass, Globe, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-12 transition-colors duration-300 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & About */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2 font-bold text-lg">
              <Compass className="h-5 w-5 text-amber-500" />
              <span className="text-slate-900 font-extrabold tracking-tight">Explore World</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              We specialize in offering high-end, luxury tour packages across 26 Indian States and 32 global international countries. Explore the world in style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Holiday Deals</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/packages?category=national" className="text-slate-500 hover:text-amber-500 transition-colors">
                  National Packages
                </Link>
              </li>
              <li>
                <Link href="/packages?category=international" className="text-slate-500 hover:text-amber-500 transition-colors">
                  International Packages
                </Link>
              </li>
              <li>
                <Link href="/packages?type=Honeymoon" className="text-slate-500 hover:text-amber-500 transition-colors">
                  Honeymoon Getaways
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Legal & Safe</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <span className="text-slate-500 hover:text-amber-500 cursor-pointer transition-colors flex items-center space-x-1">
                  <Shield className="h-3 w-3 text-amber-500" />
                  <span>Travel Protection</span>
                </span>
              </li>
              <li>
                <span className="text-slate-500 hover:text-amber-500 cursor-pointer transition-colors flex items-center space-x-1">
                  <Globe className="h-3 w-3 text-amber-500" />
                  <span>Customs Guides</span>
                </span>
              </li>
              <li>
                <span className="text-slate-500 hover:text-amber-500 cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>

          {/* Subscribe */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Subscribe to Luxury</h4>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full rounded-l-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500/50 transition-all font-semibold"
              />
              <button className="rounded-r-xl bg-slate-950 px-3.5 text-xs font-bold text-white hover:bg-slate-900 transition-colors">
                Join
              </button>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} Explore World Inc. All rights reserved.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Crafted with <Heart className="h-3.5 w-3.5 text-amber-500 mx-1 fill-amber-500" /> for luxury travellers.
          </p>
        </div>
      </div>
    </footer>
  );
}
