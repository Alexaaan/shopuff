'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { UserNotification } from '@/types/notifications';
import { useNotifications } from '@/lib/NotificationContext';
import { playNotificationSound } from '@/services/chatAudio';

interface UseNotificationsRealtimeProps {
  userId: number | undefined;
  enabled?: boolean;
}

export function useNotificationsRealtime({ 
  userId, 
  enabled = true 
}: UseNotificationsRealtimeProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { incrementUnread, refresh } = useNotifications();

  const connect = useCallback(() => {
    if (!userId || typeof window === 'undefined') return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create WebSocket connection
    // Note: Replace with your actual WebSocket server URL
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://your-domain.com/ws';
    
    try {
      wsRef.current = new WebSocket(`${wsUrl}?userId=${userId}`);

      wsRef.current.onopen = () => {
        console.log('[Notifications] WebSocket connected');
        setIsConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_notification') {
            // Play notification sound
            playNotificationSound();
            
            // Update notification count
            incrementUnread();
            
            // Refresh notifications list
            refresh();
            
            // Optional: Show browser notification
            if (Notification.permission === 'granted' && data.notification) {
              new Notification(data.notification.title, {
                body: data.notification.message,
                icon: '/logo.png'
              });
            }
          }
        } catch (error) {
          console.error('[Notifications] Error parsing message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('[Notifications] WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('[Notifications] WebSocket error:', error);
      };
    } catch (error) {
      console.error('[Notifications] Failed to create WebSocket:', error);
    }
  }, [userId, enabled, incrementUnread, refresh]);

  useEffect(() => {
    if (enabled && userId) {
      connect();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userId, enabled, connect]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined') return false;
    
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  return {
    isConnected,
    requestPermission
  };
}
