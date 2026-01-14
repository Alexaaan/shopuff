'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Send } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

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

export const Chat = ({ orderId, onClose, orderUserId }: ChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
    requestNotificationPermission();
  }, [orderId]);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const subscribeToMessages = async () => {
    const supabase = await getSupabase();
    const channel = supabase
      .channel(`messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload: any) => {
          const newMessage = payload.new as Message;
          if (newMessage.user_id !== user?.id) {
            // Show notification
            if (Notification.permission === 'granted') {
              new Notification(`Nouveau message de ${newMessage.users.prenom} ${newMessage.users.nom}`, {
                body: newMessage.message,
                icon: '/logo.png',
              });
            }
            // Refresh messages
            fetchMessages();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
          message: newMessage.trim()
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) return <div className="chat-modal">Loading...</div>;

  return (
    <div className="chat-modal">
      <div className="chat-header">
        <h3>Chat Commande #{orderId}</h3>
        <button onClick={onClose}>Fermer</button>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.users && msg.users.id === orderUserId ? 'user' : 'admin'}`}>
            <strong>{msg.users ? `${msg.users.prenom} ${msg.users.nom}` : 'Vous'}:</strong> {msg.message}
            <small>{new Date(msg.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tapez votre message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};