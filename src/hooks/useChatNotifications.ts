import { useEffect, useCallback } from 'react';
import { Message } from '@/services/chatApi';
import { playNotificationSound } from '@/services/chatAudio';

interface UseChatNotificationsProps {
  onRefresh: () => void;
}

export function useChatNotifications({ onRefresh }: UseChatNotificationsProps) {
  const handleFCMMessage = useCallback((event: CustomEvent) => {
    const payload = event.detail;
    if (payload?.data?.type === 'new_order' && payload.data.orderId) {
      onRefresh();
      playNotificationSound();
    }
  }, [onRefresh]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('fcm-message', handleFCMMessage as EventListener);

    return () => {
      window.removeEventListener('fcm-message', handleFCMMessage as EventListener);
    };
  }, [handleFCMMessage]);
}
