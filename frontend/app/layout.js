import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { AuthProvider } from '@/context/AuthContext';
import { Fraunces } from 'next/font/google';

const fraunces = Fraunces({ 
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata = {
  title: 'ShubhYatra | AI Tourist Safety',
  description: 'AI-powered tourist safety platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body className="bg-background-light text-text-main min-h-screen pb-20 md:pb-0">
        <AuthProvider>
          <Header />
          {children}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
