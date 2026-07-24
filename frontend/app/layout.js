import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { LanguageProvider } from '@/context/LanguageContext';
import OnboardingNudge from '@/components/OnboardingNudge';
import { Fraunces } from 'next/font/google';

const fraunces = Fraunces({ 
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata = {
  title: 'ShubhYatra | AI Tourist Safety',
  description: 'AI-powered tourist safety platform.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ShubhYatra',
  },
  icons: {
    apple: '/icon-192x192.png',
  }
};

export const viewport = {
  themeColor: '#E8735F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body className="font-sans bg-background-light text-text-main flex flex-col min-h-screen pb-20 md:pb-0">
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <Header />
              {children}
              <BottomNav />
              <OnboardingNudge />
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
