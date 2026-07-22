'use client';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#FFF8F3] text-[#2C2C2C] min-h-screen font-sans">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white/60 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
            <div className="w-16 h-16 mx-auto bg-[#D64545]/10 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-[#D64545]" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Something went wrong</h2>
            <p className="text-[#2C2C2C]/70 mb-8 leading-relaxed">
              A critical error occurred. Please try reloading the page.
            </p>
            <button
              onClick={() => reset()}
              className="flex items-center justify-center w-full gap-2 bg-[#E8735F] hover:bg-[#E8735F]/90 text-white font-medium py-3 rounded-xl transition-all shadow-sm"
            >
              <RefreshCcw className="w-5 h-5" />
              Reload Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
