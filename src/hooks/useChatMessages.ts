import { useState, useCallback, useRef } from 'react';
import { Message, fetchMessages, sendMessage, markMessagesAsRead } from '@/services/chatApi';
import { generateClientId } from '@/services/chatClientId';

interface UseChatMessagesProps {
  orderId: number;
  userId?: number;
  orderUserId?: number;
}

interface UseChatMessagesReturn {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  sendMessage: (text: string) => Promise<void>;
  retryMessage: (clientId: string, text: string) => void;
  markAsRead: () => Promise<void>;
}

export function useChatMessages({
  orderId,
  userId,
  orderUserId
}: UseChatMessagesProps): UseChatMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const sentMessagesRef = useRef<Set<string>>(new Set());

  // Fetch messages
  const fetch = useCallback(async () => {
    try {
      const data = await fetchMessages(orderId);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Initial fetch
  useState(() => {
    fetch();
  });

  // Mark as read
  const markAsRead = useCallback(async () => {
    if (!userId) return;
    try {
      await markMessagesAsRead(orderId, userId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [orderId, userId]);

  // Send message with optimistic UI
  const sendMessageFn = useCallback(async (text: string) => {
    if (!text.trim() || !userId || sending) return;

    const clientId = generateClientId();
    const messageToSend = text.trim();

    // Create optimistic message
    const optimisticMessage: Message = {
      id: Date.now(),
      client_id: clientId,
      message: messageToSend,
      created_at: new Date().toISOString(),
      user_id: userId,
      status: 'sending',
      users: { id: userId, nom: '', prenom: '' }
    };

    setSending(true);
    setMessages(prev => [...prev, optimisticMessage]);
    setMessages(prev => prev.filter(m => m.client_id !== clientId)); // Clear optimistic from input

    try {
      const result = await sendMessage({
        orderId,
        userId,
        message: messageToSend,
        isChatOpen: true,
        clientId
      });

      setMessages(prev =>
        prev.map(m => m.client_id === clientId ? { ...result.message, status: 'sent' as const } : m)
      );
      sentMessagesRef.current.add(clientId);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev =>
        prev.map(m => m.client_id === clientId ? { ...m, status: 'failed' as const } : m)
      );
    } finally {
      setSending(false);
    }
  }, [orderId, userId, sending]);

  // Retry failed message
  const retryMessage = useCallback((clientId: string, text: string) => {
    setMessages(prev => prev.filter(m => m.client_id !== clientId));
    sentMessagesRef.current.delete(clientId);
    // Re-add to input - caller handles this
  }, []);

  return {
    messages,
    loading,
    sending,
    sendMessage: sendMessageFn,
    retryMessage,
    markAsRead
  };
}

// Helper to check if message is from current user
export function isUserMessage(msg: Message, orderUserId?: number): boolean {
  return msg.users?.id === orderUserId;
}
