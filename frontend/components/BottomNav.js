"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShieldCheck, ShieldAlert, Users, User, LayoutDashboard, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const links = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/scan', icon: ShieldCheck, label: 'Scan' },
    { href: '/report', icon: Flag, label: 'Report' },
    { href: '/emergency', icon: ShieldAlert, label: 'Emergency' },
    { href: '/connect', icon: Users, label: 'Connect' },
  ];

  if (user?.isAdmin) {
    links.push({ href: '/admin', icon: LayoutDashboard, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/60 backdrop-blur-xl border-t border-white/40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around px-2 pb-safe">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              aria-label={link.label}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-2 flex-1 transition-all duration-200",
                isActive ? "text-primary-dark scale-110" : "text-text-main/50 hover:text-text-main"
              )}
            >
              <Icon className={cn("w-6 h-6 mb-1 transition-colors", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              <span className={cn("text-[10px] tracking-wide transition-all", isActive ? "font-bold" : "font-medium")}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
