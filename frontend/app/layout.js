import './globals.css';
import Header from '@/components/Header';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'ShubhYatra | AI Tourist Safety',
  description: 'AI-powered tourist safety platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 min-h-screen">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
