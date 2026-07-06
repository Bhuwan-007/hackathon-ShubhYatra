"use client";
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();
  
  const links = [
    { href: '/', label: 'Safety Briefings' },
    { href: '/scan', label: 'Scam Scanner' },
    { href: '/report', label: 'Report Hazard' },
    { href: '/emergency', label: 'Emergency' },
  ];

  return (
    <header className="w-full bg-white border-b border-stone-200/60 sticky top-0 z-50 backdrop-blur-md bg-white/70">
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <span className="text-xl font-semibold tracking-tight text-stone-800">ShubhYatra</span>
        </Link>
        <nav className="flex items-center gap-4 md:gap-6 text-sm font-medium overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
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
      </div>
    </header>
  );
}
