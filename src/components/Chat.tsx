'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Send, X, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: number;
  message: string;
  created_at: string;
  user_id: number;
  users: {
    id: number;
    nom: string;
    prenom: string;
  };
}

interface ChatProps {
  orderId: number;
  onClose: () => void;
  orderUserId?: number;
}

const Chat = ({ orderId, onClose, orderUserId }: ChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const fcmHandlerRef = useRef<any>(null);

  useEffect(() => {
    fetchMessages();
    requestNotificationPermission();

    // Set presence active
    fetch('/api/chat/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user?.id, order_id: orderId, is_active: true })
    }).catch(() => {});

    // Listen for FCM messages via custom event (for new_order notifications)
    const handleFCMMessage = (event: CustomEvent) => {
      const payload = event.detail;
      if (payload?.data?.type === 'new_order' && payload.data.orderId) {
        // Refresh messages when a new order notification arrives
        fetchMessages();
        // Play notification sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('fcm-message', handleFCMMessage as EventListener);
    }

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`messages:${orderId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `order_id=eq.${orderId}`
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);

        // Show notification if from other user and document is hidden (for web)
        if (newMsg.users && newMsg.users.id !== user?.id) {
          // Play sound only (notifications are handled by Service Worker to avoid duplicates)
          const audio = new Audio('/notification.mp3'); // Assume we have a sound file
          audio.play().catch(() => {}); // Ignore errors if no sound file
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      // Set presence inactive
      fetch('/api/chat/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id, order_id: orderId, is_active: false })
      }).catch(() => {});
      
      // Cleanup FCM listener
      if (typeof window !== 'undefined') {
        window.removeEventListener('fcm-message', handleFCMMessage as EventListener);
      }
    };
  }, [orderId, user?.id]);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };


  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?orderId=${orderId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          user_id: user.id,
          message: newMessage.trim(),
          is_chat_open: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        setMessages(prev => [...prev, result.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const cancelOrder = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, statut: 'annulee' })
      });

      if (response.ok) {
        alert('Commande annulée avec succès');
        onClose();
      } else {
        alert('Erreur lors de l\'annulation de la commande');
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      alert('Erreur serveur');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Chargement du chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex flex-col">
      {/* Modern Chat Header */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-b border-purple-500/20 shadow-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-slate-600/50 hover:border-purple-500/50"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Retour</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Commande #{orderId}</h3>
              <p className="text-xs text-slate-400">Support client</p>
            </div>
          </div>

          <div className="flex gap-2">
            {user?.id === orderUserId && (
              <button
                onClick={cancelOrder}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-xl transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
                title="Annuler la commande"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Annuler</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-slate-400">Aucun message pour le moment</p>
            <p className="text-slate-500 text-sm mt-1">Envoyez le premier message !</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.users && msg.users.id === orderUserId;
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm'
                    : 'bg-slate-700/50 text-slate-200 rounded-bl-sm border border-slate-600/50'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${isUser ? 'text-purple-100' : 'text-purple-300'}`}>
                      {msg.users ? `${msg.users.prenom} ${msg.users.nom}` : 'Vous'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  <p className={`text-xs mt-2 ${isUser ? 'text-purple-200' : 'text-slate-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="bg-slate-800/90 backdrop-blur-sm border-t border-purple-500/20 px-4 py-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;