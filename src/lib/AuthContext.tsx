'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { requestFCMToken } from './firebase';

interface User {
  id: number;
  nom: string;
  prenom: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (secretCode: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (secretCode: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret_code: secretCode })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        // Register FCM token for push notifications
        if (typeof window !== 'undefined') {
          console.log('[DEBUG] Requesting FCM token for user:', data.user.id);
          requestFCMToken(data.user.id);

          // Envoyer une notification de bienvenue si c'est la première connexion
          if (data.user.is_active) {
            // TODO: Envoyer notification de bienvenue
            console.log('User logged in successfully - welcome notification could be sent');
          }
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };



  const logout = () => {
    setUser(null);
    // Optionally call logout API to clear cookie
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};