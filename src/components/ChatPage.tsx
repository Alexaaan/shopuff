'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ChatHeader } from './chat/ChatHeader';
import { MessageList } from './chat/MessageList';
import { ChatInput } from './chat/ChatInput';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatRealtime } from '@/hooks/useChatRealtime';
import { useChatPresence } from '@/hooks/useChatPresence';
import { useChatNotifications } from '@/hooks/useChatNotifications';
import { useChatScroll } from '@/hooks/useChatScroll';
import { cancelOrder } from '@/services/chatApi';
import { playNotificationSound } from '@/services/chatAudio';

export interface ChatPageProps {
  orderId: number;
  onClose: () => void;
  orderUserId?: number;
}

// Loading screen
function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-300 text-lg">Chargement du chat...</p>
      </div>
    </div>
  );
}

export default function ChatPage({ orderId, onClose, orderUserId }: ChatPageProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [retryData, setRetryData] = useState<{ clientId: string; text: string } | null>(null);

  // Handle realtime message with sound for others
  const handleRealtimeMessage = useCallback((msg: any) => {
    if (msg.users && msg.users.id !== user?.id) {
      playNotificationSound();
    }
  }, [user?.id]);

  // Hooks
  const { messages, loading, sending, sendMessage, retryMessage, markAsRead, addRealtimeMessage } = useChatMessages({
    orderId,
    userId: user?.id,
    orderUserId,
    onRealtimeMessage: handleRealtimeMessage
  });

  const { messagesEndRef, scrollToBottom } = useChatScroll({
    loading,
    messagesCount: messages.length
  });

  const { isConnected } = useChatRealtime({
    orderId,
    userId: user?.id,
    onNewMessage: addRealtimeMessage
  });

  useChatPresence({ userId: user?.id, orderId, isActive: true });

  useChatNotifications({ onRefresh: () => {} });

  // Scroll when messages change
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, loading, scrollToBottom]);

  // Mark as read on mount
  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  // Handle retry
  const handleRetry = useCallback((clientId: string, text: string) => {
    setRetryData({ clientId, text });
  }, []);

  // Send message
  const handleSend = useCallback(async () => {
    const text = retryData ? retryData.text : newMessage;
    if (!text.trim() || sending) return;

    if (retryData) {
      retryMessage(retryData.clientId, retryData.text);
      setRetryData(null);
    } else {
      await sendMessage(text);
      setNewMessage('');
    }
  }, [newMessage, sending, retryData, sendMessage, retryMessage]);

  // Handle cancel order
  const handleCancelOrder = useCallback(async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
    try {
      await cancelOrder(orderId);
      alert('Commande annulée avec succès');
      onClose();
    } catch {
      alert('Erreur lors de l\'annulation');
    }
  }, [orderId, onClose]);

  // Keyboard handler
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) return <LoadingScreen />;

  const currentText = retryData ? retryData.text : newMessage;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex flex-col">
      <ChatHeader
        orderId={orderId}
        isConnected={isConnected}
        canCancel={user?.id === orderUserId}
        onClose={onClose}
        onCancelOrder={handleCancelOrder}
      />

      <MessageList
        ref={messagesEndRef}
        messages={messages}
        orderUserId={orderUserId}
        onRetry={handleRetry}
      />

      <ChatInput
        value={currentText}
        onChange={(val) => retryData ? setRetryData({ ...retryData, text: val }) : setNewMessage(val)}
        onSend={handleSend}
        onKeyPress={handleKeyPress}
        sending={sending}
        disabled={!retryData && !user}
      />
    </div>
  );
}
