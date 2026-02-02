'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Send, X, ChevronLeft, Check, CheckCheck, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Types
interface Message {
  id: number;
  client_id?: string; // Client-generated ID for deduplication
  message: string;
  created_at: string;
  user_id: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
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

// Generate unique client ID for deduplication
const generateClientId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const Chat = ({ orderId, onClose, orderUserId }: ChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  
  // Refs
  const channelRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sentMessagesRef = useRef<Set<string>>(new Set()); // Track sent messages for deduplication
  const typingTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading, scrollToBottom]);

  // Fetch messages with deduplication check
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages?orderId=${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          user_id: user.id
        })
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [orderId, user]);

  useEffect(() => {
    fetchMessages();
    markAsRead();

    // Set presence active
    fetch('/api/chat/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: user?.id, 
        order_id: orderId, 
        is_active: true 
      })
    }).catch(() => {});

    // Listen for FCM messages
    const handleFCMMessage = (event: CustomEvent) => {
      const payload = event.detail;
      if (payload?.data?.type === 'new_order' && payload.data.orderId) {
        fetchMessages();
        markAsRead();
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('fcm-message', handleFCMMessage as EventListener);
    }

    // Subscribe to real-time updates with deduplication
    const channel = supabase
      .channel(`messages:${orderId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `order_id=eq.${orderId}`
      }, (payload) => {
        const newMsg = payload.new as Message;
        
        // Deduplication: skip if we already have this message
        if (sentMessagesRef.current.has(`msg_${newMsg.id}`)) {
          return;
        }

        setMessages(prev => {
          // Check for duplicate by content and time window
          const isDuplicate = prev.some(m => 
            m.message === newMsg.message &&
            m.user_id === newMsg.user_id &&
            Math.abs(new Date(m.created_at).getTime() - new Date(newMsg.created_at).getTime()) < 2000
          );
          
          if (isDuplicate) return prev;
          
          return [...prev, { ...newMsg, status: 'delivered' }];
        });

        // Play sound for messages from others
        if (newMsg.users && newMsg.users.id !== user?.id) {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {});
        }
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      // Set presence inactive
      fetch('/api/chat/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user?.id, 
          order_id: orderId, 
          is_active: false 
        })
      }).catch(() => {});
      
      if (typeof window !== 'undefined') {
        window.removeEventListener('fcm-message', handleFCMMessage as EventListener);
      }
    };
  }, [orderId, user?.id, fetchMessages, markAsRead]);

  // Optimistic send with rollback
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;

    const clientId = generateClientId();
    const messageToSend = newMessage.trim();
    
    // Optimistic update
    const optimisticMessage: Message = {
      id: Date.now(), // Temporary ID
      client_id: clientId,
      message: messageToSend,
      created_at: new Date().toISOString(),
      user_id: user.id,
      status: 'sending',
      users: {
        id: user.id,
        nom: '',
        prenom: ''
      }
    };

    setSending(true);
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          user_id: user.id,
          message: messageToSend,
          is_chat_open: true,
          client_id: clientId
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Replace optimistic message with real one
        setMessages(prev => prev.map(m => 
          m.client_id === clientId 
            ? { ...result.message, status: 'sent' }
            : m
        ));
        
        sentMessagesRef.current.add(clientId);
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Rollback: mark as failed
      setMessages(prev => prev.map(m => 
        m.client_id === clientId 
          ? { ...m, status: 'failed' }
          : m
      ));
    } finally {
      setSending(false);
    }
  };

  // Retry failed message
  const retryMessage = async (clientId: string, messageText: string) => {
    if (!user) return;

    // Remove failed status
    setMessages(prev => prev.filter(m => m.client_id !== clientId));
    sentMessagesRef.current.delete(clientId);
    
    // Re-add to input
    setNewMessage(messageText);
  };

  // Request notification permission
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
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

  // Get status icon
  const getStatusIcon = (status: string | undefined, isUser: boolean) => {
    if (!isUser) return null;
    
    switch (status) {
      case 'sending':
        return <Loader2 className="w-3 h-3 animate-spin text-white/70" />;
      case 'sent':
        return <Check className="w-3 h-3 text-white/70" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-white/70" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-300" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-300" />;
      default:
        return null;
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
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-b border-purple-500/20 shadow-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-slate-600/50 hover:border-purple-500/50 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Retour</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              {/* Connection indicator */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
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
                className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-xl transition-all duration-200 border border-red-500/30 hover:border-red-500/50 active:scale-95"
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
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
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
            const isFailed = msg.status === 'failed';
            
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative max-w-[85%] lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm'
                    : 'bg-slate-700/50 text-slate-200 rounded-bl-sm border border-slate-600/50'
                } ${isFailed ? 'border border-red-400/50' : ''}`}>
                  {/* Failed indicator */}
                  {isFailed && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${isUser ? 'text-purple-100' : 'text-purple-300'}`}>
                      {msg.users ? `${msg.users.prenom} ${msg.users.nom}` : 'Vous'}
                    </span>
                    {getStatusIcon(msg.status, isUser)}
                  </div>
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <p className={`text-xs ${isUser ? 'text-purple-200' : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {isFailed && (
                      <button
                        onClick={() => retryMessage(msg.client_id!, msg.message)}
                        className="text-xs text-purple-300 hover:text-purple-200 underline"
                      >
                        Réessayer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Touch optimized */}
      <div className="bg-slate-800/90 backdrop-blur-sm border-t border-purple-500/20 px-4 py-4 safe-area-bottom">
        <div className="flex gap-3 items-end">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                !sending && sendMessage();
              }
            }}
            disabled={sending}
            className={`flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 min-h-[48px] ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Message"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className={`min-w-[56px] h-[48px] flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 touch-manipulation ${sending ? 'animate-pulse' : ''}`}
            aria-label="Envoyer le message"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
