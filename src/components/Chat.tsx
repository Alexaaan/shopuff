'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Send } from 'lucide-react';

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
  const lastMessagesLength = useRef(0);

  useEffect(() => {
    fetchMessages();
    requestNotificationPermission();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };


  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?orderId=${orderId}`);
      const data = await response.json();
      if (data.length > lastMessagesLength.current && lastMessagesLength.current > 0) {
        // New messages arrived
        const newMsgs = data.slice(lastMessagesLength.current);
        newMsgs.forEach((msg: Message) => {
          if (msg.users && msg.users.id !== user?.id) {
            if (Notification.permission === 'granted') {
              new Notification(`Nouveau message de ${msg.users.prenom} ${msg.users.nom}`, {
                body: msg.message,
                icon: '/logo.png',
              });
            }
          }
        });
      }
      setMessages(data);
      lastMessagesLength.current = data.length;
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