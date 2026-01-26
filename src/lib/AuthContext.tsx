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
  notificationStatus: 'none' | 'requesting' | 'granted' | 'denied' | 'registered' | 'error';
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
  const [notificationStatus, setNotificationStatus] = useState<'none' | 'requesting' | 'granted' | 'denied' | 'registered' | 'error'>('none');

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

        // Register FCM token for push notifications avec gestion d'erreurs améliorée
        if (typeof window !== 'undefined') {
          setNotificationStatus('requesting');
          try {
            const tokenResult = await requestFCMToken(data.user.id);
            if (tokenResult) {
              setNotificationStatus('registered');
              console.log('✅ Notifications registered successfully for user:', data.user.id);
            } else {
              setNotificationStatus('denied');
              console.log('⚠️ Notifications not available for user:', data.user.id);
            }
          } catch (notificationError) {
            console.error('❌ Error registering notifications:', notificationError);
            setNotificationStatus('error');
          }
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      setNotificationStatus('error');
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
      isLoading,
      notificationStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};