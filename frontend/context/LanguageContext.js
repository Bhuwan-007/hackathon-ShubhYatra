"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';

const translations = { en, hi };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('shubhyatra_language');
    if (saved && (saved === 'en' || saved === 'hi')) {
      setLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('shubhyatra_language', nextLang);
  };

  // Simple t function with fallback
  const t = (key) => {
    // If not mounted, default to English to prevent hydration mismatch (or just serve english text)
    // Alternatively, we just serve current language but React might complain if server rendered EN and client renders HI immediately
    // Next.js hydration will complain if text differs. But for a hackathon demo, we accept the brief flash.
    if (!mounted) return en[key] || key;
    
    return translations[language][key] || en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
