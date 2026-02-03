import { useEffect, useRef } from 'react';
import { updatePresence } from '@/services/chatApi';

interface UseChatPresenceProps {
  userId?: number;
  orderId: number;
  isActive: boolean;
}

export function useChatPresence({ userId, orderId, isActive }: UseChatPresenceProps) {
  const initializedRef = useRef(false);
  const cleanupDoneRef = useRef(false);

  useEffect(() => {
    // Skip if no userId or orderId
    if (!userId || !orderId) {
      console.log('[Presence] Skipping - no userId or orderId:', { userId, orderId });
      return;
    }

    // Skip if already initialized (prevent duplicate calls)
    if (initializedRef.current) {
      console.log('[Presence] Already initialized, skipping');
      return;
    }

    initializedRef.current = true;
    cleanupDoneRef.current = false;

    console.log('[Presence] Setting active for user:', userId, 'order:', orderId);

    // Set presence on mount
    updatePresence({ userId, orderId, isActive: true })
      .then(() => console.log('[Presence] Active set successfully'))
      .catch(err => console.error('[Presence] Error setting active:', err));

    // Cleanup: set inactive on unmount
    return () => {
      if (cleanupDoneRef.current) {
        return;
      }
      cleanupDoneRef.current = true;

      if (userId && orderId) {
        console.log('[Presence] Setting inactive for user:', userId, 'order:', orderId);
        updatePresence({ userId, orderId, isActive: false })
          .then(() => console.log('[Presence] Inactive set successfully'))
          .catch(err => console.error('[Presence] Error setting inactive:', err));
      }
    };
  }, [userId, orderId, isActive]);
}
