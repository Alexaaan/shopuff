'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const Chat = dynamic(() => import('@/components/Chat'), { ssr: false });

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

function AdminChatsContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  // Auto-open chat if orderId in URL
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId && orders.length > 0) {
      const order = orders.find(o => o.id === parseInt(orderId));
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [searchParams, orders]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="admin-chats">
        <button
          onClick={() => setSelectedOrder(null)}
          className="mb-4 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-all"
        >
          ← Retour aux conversations
        </button>
        <Chat orderId={selectedOrder.id} onClose={() => setSelectedOrder(null)} orderUserId={selectedOrder.utilisateur_id} />
      </div>
    );
  }

  return (
    <div className="admin-chats min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Chats des Commandes en Attente</h1>
      <div className="conversations-list space-y-4">
        {orders.map(order => (
          <div
            key={order.id}
            className="conversation-item bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer"
            onClick={() => setSelectedOrder(order)}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Commande #{order.id} - {order.users.prenom} {order.users.nom}</h3>
                <p className="text-sm text-slate-400">
                  {order.debut_commande ? new Date(order.debut_commande).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' }) : ''}
                </p>
              </div>
              <span className="text-xl font-bold text-green-400">{order.total}€</span>
            </div>
            <p className="text-slate-300">
              {order.order_products.map(op => `${op.quantite}x ${op.products.nom}`).join(', ')}
            </p>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-slate-400 text-center py-8">Aucune commande en attente avec chat.</p>
        )}
      </div>
    </div>
  );
}

export default function AdminChats() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Chargement...</p>
        </div>
      </div>
    }>
      <AdminChatsContent />
    </Suspense>
  );
}
