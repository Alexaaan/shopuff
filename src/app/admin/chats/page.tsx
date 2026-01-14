'use client';

import { useState, useEffect } from 'react';
import { Chat } from '@/components/Chat';

interface Order {
  id: number;
  utilisateur_id: number;
  statut: string;
  debut_commande: string;
  users: {
    nom: string;
    prenom: string;
  };
  order_products: {
    quantite: number;
    prix_unitaire: number;
    products: {
      nom: string;
    };
  }[];
  total: number;
}

export default function AdminChats() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      const pending = data.filter((order: Order) => order.statut === 'en_attente');
      setOrders(pending);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (selectedOrder) {
    return (
      <div className="admin-chats">
        <button onClick={() => setSelectedOrder(null)}>← Retour aux conversations</button>
        <Chat orderId={selectedOrder.id} onClose={() => setSelectedOrder(null)} orderUserId={selectedOrder.utilisateur_id} />
      </div>
    );
  }

  return (
    <div className="admin-chats">
      <h1>Chats des Commandes en Attente</h1>
      <div className="conversations-list">
        {orders.map(order => (
          <div
            key={order.id}
            className="conversation-item"
            onClick={() => setSelectedOrder(order)}
          >
            <div className="conversation-header">
              <h3>Commande #{order.id} - {order.users.prenom} {order.users.nom}</h3>
              <span className="order-total">{order.total}€</span>
            </div>
            <p className="order-products">
              {order.order_products.map(op => `${op.quantite}x ${op.products.nom}`).join(', ')}
            </p>
            <p className="order-date">
              {order.debut_commande ? new Date(order.debut_commande).toLocaleDateString() : ''}
            </p>
          </div>
        ))}
        {orders.length === 0 && <p>Aucune commande en attente avec chat.</p>}
      </div>
    </div>
  );
}