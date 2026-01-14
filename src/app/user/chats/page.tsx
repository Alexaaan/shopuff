'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Chat from '@/components/Chat';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

interface Order {
  id: number;
  utilisateur_id: number;
  statut: string;
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
  debut_commande: string;
}

export default function UserChats() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      const userOrders = data.filter((order: Order) => order.utilisateur_id === user?.id && order.statut === 'en_attente');
      setOrders(userOrders);
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
        <button onClick={() => setSelectedOrder(null)}>← Retour à mes conversations</button>
        <Link href="/"><button>Retour à l'accueil</button></Link>
        <Chat orderId={selectedOrder.id} onClose={() => setSelectedOrder(null)} orderUserId={user?.id} />
      </div>
    );
  }

  return (
    <div className="admin-chats">
      <h1>Mes Conversations de Commandes</h1>
      <div className="conversations-list">
        {orders.map(order => (
          <div
            key={order.id}
            className="conversation-item"
            onClick={() => setSelectedOrder(order)}
          >
            <div className="conversation-header">
              <h3>Commande #{order.id}</h3>
              <span className="order-total">{order.total}€</span>
            </div>
            <p className="order-products">
              {order.order_products.map(op => `${op.quantite}x ${op.products.nom}`).join(', ')}
            </p>
            <p className="order-date">
              {new Date(order.debut_commande).toLocaleDateString()}
            </p>
          </div>
        ))}
        {orders.length === 0 && <p>Vous n'avez pas de commandes en cours.</p>}
      </div>
    </div>
  );
}