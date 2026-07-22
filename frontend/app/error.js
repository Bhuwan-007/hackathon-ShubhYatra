'use client';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('App-level error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-background-light text-text-main font-sans selection:bg-secondary/50">
      <div className="max-w-md w-full bg-white/60 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="w-16 h-16 mx-auto bg-alert/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-alert" />
        </div>
        <h2 className="text-2xl font-bold font-display mb-3">Something went wrong</h2>
        <p className="text-text-main/70 mb-8 leading-relaxed">
          We encountered an unexpected error while trying to load this page. Please try refreshing.
        </p>
        <button
          onClick={() => reset()}
          className="flex items-center justify-center w-full gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-all shadow-sm"
        >
          <RefreshCcw className="w-5 h-5" />
          Refresh Page
        </button>
      </div>
    </div>
  );
}
