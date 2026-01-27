'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import OrderForm from '@/components/admin/OrderForm';
import StatCard from '@/components/admin/StatCard';
import AdminCard from '@/components/admin/AdminCard';

interface Order {
  id: number;
  utilisateur_id: number;
  vendeur_id: number | null;
  debut_commande: string;
  fin_commande: string | null;
  statut: string;
  payment_method: string;
  adresse_livraison: string | null;
  total: number;
  notes?: string;
  users: {
    nom: string;
    prenom: string;
    email: string;
  };
  order_products: {
    quantite: number;
    prix_unitaire: number;
    products: {
      nom: string;
    };
  }[];
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    todayOrders: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);

      // Calculer les statistiques
      const totalOrders = data.length;
      const totalRevenue = data
        .filter((order: Order) => order.statut === 'confirmee' || order.statut === 'livree')
        .reduce((sum: number, order: Order) => sum + order.total, 0);

      const pendingOrders = data.filter((order: Order) => order.statut === 'en_attente').length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = data.filter((order: Order) =>
        new Date(order.debut_commande) >= today
      ).length;

      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders,
        todayOrders
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (orderData: any) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ Commande créée avec succès !');
        setShowForm(false);
        await fetchOrders(); // Refresh la liste
      } else {
        alert(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('❌ Erreur lors de la création de la commande');
    } finally {
      setSubmitting(false);
    }
  };

  const updateOrderStatus = async (id: number, statut: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, statut })
      });

      if (response.ok) {
        await fetchOrders(); // Refresh the list
      } else {
        console.error('Error updating order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const updateOrderPayment = async (id: number, payment_method: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, payment_method })
      });

      if (response.ok) {
        await fetchOrders(); // Refresh the list
      } else {
        console.error('Error updating payment method');
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'confirmee': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'en_preparation': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'livree': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'annulee': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'confirmee': return 'Confirmée';
      case 'en_preparation': return 'En préparation';
      case 'livree': return 'Livrée';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="📋 Commandes" subtitle="Chargement en cours...">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p className="text-slate-300 ml-4">Chargement des commandes...</p>
        </div>
      </AdminLayout>
    );
  }

  if (showForm) {
    return (
      <AdminLayout title="📋 Commandes" subtitle="Créer une nouvelle commande">
        <OrderForm
          onSubmit={handleCreateOrder}
          onCancel={() => setShowForm(false)}
          loading={submitting}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="📋 Commandes"
      subtitle="Gestion complète des commandes et stocks"
    >
      {/* Statistiques */}
      <div className="admin-stats max-w-6xl mx-auto mb-8">
        <StatCard
          icon="📦"
          value={stats.totalOrders}
          label="Total Commandes"
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon="💰"
          value={`${stats.totalRevenue.toFixed(2)}€`}
          label="Chiffre d'Affaires"
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          icon="⏳"
          value={stats.pendingOrders}
          label="En Attente"
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          icon="📅"
          value={stats.todayOrders}
          label="Aujourd'hui"
          color="from-purple-500 to-pink-500"
        />
      </div>

      {/* Bouton ajouter commande */}
      <div className="mb-8">
        <button
          onClick={() => setShowForm(true)}
          className="admin-btn"
        >
          <span className="text-xl mr-2">➕</span>
          Nouvelle Commande
        </button>
      </div>

      {/* Liste des commandes */}
      <AdminCard>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Produits</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Paiement</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="font-medium text-white">#{order.id}</td>
                  <td>
                    <div className="font-medium text-white">
                      {order.users.prenom} {order.users.nom}
                    </div>
                    <div className="text-sm text-slate-400">
                      {order.users.nom.startsWith('Client-') && order.users.nom.includes(order.users.prenom)
                        ? 'Client unique'
                        : order.users.email || 'N/A'
                      }
                    </div>
                  </td>
                  <td>
                    <div className="max-w-xs">
                      {order.order_products.map((op, index) => (
                        <div key={index} className="text-sm text-slate-300">
                          {op.quantite}x {op.products.nom}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="font-bold text-green-400">
                    {order.total.toFixed(2)}€
                  </td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.statut)}`}>
                      {getStatusLabel(order.statut)}
                    </span>
                  </td>
                  <td>
                    <select
                      className="admin-form-input text-sm py-1 px-2 w-auto"
                      value={order.payment_method || ''}
                      onChange={(e) => updateOrderPayment(order.id, e.target.value)}
                    >
                      <option value="espece">💵 Espèces</option>
                      <option value="carte_bleue">💳 Carte</option>
                      <option value="cheque">📄 Chèque</option>
                      <option value="virement">🏦 Virement</option>
                    </select>
                  </td>
                  <td className="text-sm text-slate-300">
                    {new Date(order.debut_commande).toLocaleDateString('fr-FR')}
                    <br />
                    <span className="text-xs text-slate-400">
                      {new Date(order.debut_commande).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {order.statut === 'en_attente' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmee')}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                        >
                          ✅ Confirmer
                        </button>
                      )}
                      {order.statut === 'confirmee' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'en_preparation')}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                        >
                          👨‍🍳 Préparer
                        </button>
                      )}
                      {order.statut === 'en_preparation' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'livree')}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
                        >
                          🚚 Livrer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-slate-400 text-lg">Aucune commande trouvée</p>
            <p className="text-slate-500 text-sm mt-2">Créez votre première commande !</p>
          </div>
        )}
      </AdminCard>
    </AdminLayout>
  );
}