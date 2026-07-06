"use client";
import Link from 'next/link';
import { ShieldCheck, LogOut, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { user, logout, isReady } = useAuth();
  
  const links = [
    { href: '/', label: 'Safety Briefings' },
    { href: '/scan', label: 'Scam Scanner' },
    { href: '/report', label: 'Report Hazard' },
    { href: '/emergency', label: 'Emergency' },
    { href: '/connect', label: 'Yatri Connect' },
  ];

  return (
    <header className="w-full bg-white border-b border-stone-200/60 sticky top-0 z-50 backdrop-blur-md bg-white/70">
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <span className="text-xl font-semibold tracking-tight text-stone-800">ShubhYatra</span>
        </Link>
        
        <div className="flex items-center gap-6 w-full md:w-auto">
          <nav className="flex items-center gap-4 md:gap-6 text-sm font-medium overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "transition-colors whitespace-nowrap",
                  pathname === link.href 
                    ? "text-emerald-700 border-b-2 border-emerald-600 pb-1" 
                    : "text-stone-500 hover:text-stone-900 pb-1"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Auth State Indicator */}
          {isReady && (
            <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-stone-200">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {user.displayName}
                  </span>
                  <button onClick={logout} className="text-xs font-bold text-stone-400 hover:text-red-600 transition-colors" title="Log Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link href="/connect" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
