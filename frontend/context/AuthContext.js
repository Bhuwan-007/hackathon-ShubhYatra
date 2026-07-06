"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only access localStorage in useEffect to avoid SSR errors
    const storedToken = localStorage.getItem('yatri_jwt');
    const storedUser = localStorage.getItem('yatri_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('yatri_jwt');
        localStorage.removeItem('yatri_user');
      }
    }
    setIsReady(true);
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem('yatri_jwt', newToken);
    localStorage.setItem('yatri_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('yatri_jwt');
    localStorage.removeItem('yatri_user');
    setToken(null);
    setUser(null);
  };

  const updateUserLocationState = (newLocation) => {
    if (user) {
      const updatedUser = { ...user, currentLocation: newLocation };
      localStorage.setItem('yatri_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, isReady, login, logout, updateUserLocationState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
