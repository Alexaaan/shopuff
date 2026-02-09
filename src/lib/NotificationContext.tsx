'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { UserNotification } from '@/types/notifications';
import { 
  fetchNotifications, 
  getUnreadCount, 
  markAsRead, 
  deleteNotification 
} from '@/services/notificationService';

interface NotificationContextType {
  notifications: UserNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (notificationId?: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  incrementUnread: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  userId: number;
}

export function NotificationProvider({ children, userId }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchNotifications({ userId, page: 1, limit: 50 });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      getUnreadCount(userId).then(setUnreadCount).catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, refresh]);

  const handleMarkAsRead = useCallback(async (notificationId?: number) => {
    try {
      await markAsRead({ 
        userId, 
        ...(notificationId ? { notificationId } : { markAllAsRead: true }) 
      });
      
      if (notificationId) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [userId]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteNotification({ id, userId });
      const wasUnread = notifications.find(n => n.id === id && !n.is_read);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [userId, notifications]);

  const incrementUnread = useCallback(() => {
    setUnreadCount(prev => prev + 1);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      refresh,
      markAsRead: handleMarkAsRead,
      deleteNotification: handleDelete,
      incrementUnread
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
