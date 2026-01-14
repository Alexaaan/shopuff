'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Send, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

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

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const Chat = ({ orderId, onClose, orderUserId }: ChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    fetchMessages();
    requestNotificationPermission();

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

        // Show notification if from other user and document is hidden
        if (newMsg.users && newMsg.users.id !== user?.id) {
          if (document.hidden && Notification.permission === 'granted') {
            new Notification(`Nouveau message de ${newMsg.users.prenom} ${newMsg.users.nom}`, {
              body: newMsg.message,
              icon: '/logo.png',
            });
          }
          // Play sound
          const audio = new Audio('/notification.mp3'); // Assume we have a sound file
          audio.play().catch(() => {}); // Ignore errors if no sound file
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
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
          message: newMessage.trim()
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

  if (loading) return <div className="chat-modal">Loading...</div>;

  return (
    <div className="chat-modal">
      <div className="chat-header">
        <h3>Chat de la commande #{orderId}</h3>
        <div className="flex gap-2">
          {user?.id === orderUserId && (
            <button onClick={cancelOrder} className="cancel-button" title="Annuler la commande">
              <X className="w-4 h-4" /> Annuler
            </button>
          )}
          <button onClick={onClose}>Fermer</button>
        </div>
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

export default Chat;