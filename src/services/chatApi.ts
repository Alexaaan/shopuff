// Message types
export interface Message {
  id: number;
  client_id?: string;
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

// API functions
export async function fetchMessages(orderId: number): Promise<Message[]> {
  const response = await fetch(`/api/messages?orderId=${orderId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
}

export async function sendMessage(params: {
  orderId: number;
  userId: number;
  message: string;
  isChatOpen: boolean;
  clientId?: string;
}): Promise<{ message: Message }> {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: params.orderId,
      user_id: params.userId,
      message: params.message,
      is_chat_open: params.isChatOpen,
      client_id: params.clientId
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
}

export async function markMessagesAsRead(orderId: number, userId: number): Promise<void> {
  await fetch('/api/messages/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: orderId,
      user_id: userId
    })
  });
}

export async function updatePresence(params: {
  userId: number;
  orderId: number;
  isActive: boolean;
}): Promise<void> {
  await fetch('/api/chat/presence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
}

export async function cancelOrder(orderId: number): Promise<void> {
  const response = await fetch('/api/orders', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: orderId, statut: 'annulee' })
  });
  
  if (!response.ok) {
    throw new Error('Failed to cancel order');
  }
}
