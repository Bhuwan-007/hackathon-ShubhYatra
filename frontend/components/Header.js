"use client";
import Link from 'next/link';
import { Shield, Route, LogOut, User, LayoutDashboard } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
  const pathname = usePathname();
  const { user, logout, isReady } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  const links = [
    { href: '/', label: t('nav.briefing') },
    { href: '/scan', label: t('nav.scan') },
    { href: '/report', label: t('nav.report') },
    { href: '/emergency', label: t('nav.emergency') },
    { href: '/connect', label: t('nav.connect') },
  ];

  return (
    <header className="w-full border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl bg-white/40 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center justify-center w-6 h-6">
            <Shield className="w-6 h-6 text-primary absolute" fill="currentColor" />
            <Route className="w-3.5 h-3.5 text-white absolute" strokeWidth={3} />
          </div>
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

          <div className="flex items-center gap-3 md:ml-4 md:pl-4 md:border-l md:border-white/40">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="text-xs font-bold text-text-main/70 hover:text-primary transition-colors bg-white/50 px-2 py-1 rounded-md shadow-sm border border-white/60 cursor-pointer flex items-center"
              title="Toggle Language (English/Hindi)"
            >
              {language === 'en' ? 'EN / हिंदी' : 'हिंदी / EN'}
            </button>

            {/* Auth State Indicator */}
            {isReady && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-text-main/70 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="hidden sm:inline">{user.displayName}</span>
                    </span>
                    <button onClick={logout} className="text-xs font-bold text-text-main/50 hover:text-alert transition-colors" title="Log Out">
                      <LogOut className="w-4 h-4" />
                    </button>
                    {user.isAdmin && (
                      <Link href="/admin" className="text-xs font-bold text-accent hover:text-accent/80 transition-colors flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-md" title="Admin Dashboard">
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('nav.admin')}</span>
                      </Link>
                    )}
                  </div>
                ) : (
                  <Link href="/connect" className="text-xs font-bold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors shadow-sm">
                    {t('nav.login')}
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
