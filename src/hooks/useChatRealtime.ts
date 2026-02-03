import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '@/types/chat';
import { playNotificationSound } from '@/services/chatAudio';

interface UseChatRealtimeProps {
  orderId: number;
  userId?: number;
  onNewMessage: (message: Message) => void;
}

export function useChatRealtime({
  orderId,
  userId,
  onNewMessage
}: UseChatRealtimeProps) {
  const [isConnected, setIsConnected] = useState(true);
  const channelRef = useRef<any>(null);
  const sentMessagesRef = useRef<Set<string>>(new Set());

  const handleNewMessage = useCallback((payload: { new: Message }) => {
    const newMsg = payload.new;

    // Deduplication: skip if we already have this message
    if (sentMessagesRef.current.has(`msg_${newMsg.id}`)) {
      return;
    }

    // Call the callback with the message
    onNewMessage({ ...newMsg, status: 'delivered' as const });

    // Play sound for messages from others
    if (newMsg.users && newMsg.users.id !== userId) {
      playNotificationSound();
    }
  }, [userId, onNewMessage]);

  useEffect(() => {
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`messages:${orderId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `order_id=eq.${orderId}`
      }, handleNewMessage)
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, handleNewMessage]);

  const markMessageAsReceived = useCallback((messageId: string) => {
    sentMessagesRef.current.add(`msg_${messageId}`);
  }, []);

  return { isConnected, markMessageAsReceived };
}
