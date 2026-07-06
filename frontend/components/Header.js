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
    <header className="w-full border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl bg-white/40 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4 md:gap-0">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-text-main font-display">ShubhYatra</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "transition-colors whitespace-nowrap pb-1",
                  pathname === link.href 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-text-main/60 hover:text-text-main"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Auth State Indicator */}
          {isReady && (
            <div className="flex items-center gap-3 md:ml-4 md:pl-4 md:border-l md:border-white/40">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-text-main/70 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="hidden sm:inline">{user.displayName}</span>
                  </span>
                  <button onClick={logout} className="text-xs font-bold text-text-main/50 hover:text-alert transition-colors" title="Log Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link href="/connect" className="text-xs font-bold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors shadow-sm">
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
