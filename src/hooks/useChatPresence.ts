import { useEffect } from 'react';
import { updatePresence } from '@/services/chatApi';

interface UseChatPresenceProps {
  userId?: number;
  orderId: number;
  isActive: boolean;
}

export function useChatPresence({ userId, orderId, isActive }: UseChatPresenceProps) {
  useEffect(() => {
    if (!userId) return;

    // Set presence on mount
    updatePresence({ userId, orderId, isActive }).catch(console.error);

    // Cleanup: set inactive on unmount
    return () => {
      if (isActive) {
        updatePresence({ userId, orderId, isActive: false }).catch(console.error);
      }
    };
  }, [userId, orderId, isActive]);
}
