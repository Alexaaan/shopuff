'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import AdminCard from '@/components/admin/AdminCard';

interface Order {
  id: number;
  total: number;
  statut: string;
  debut_commande: string;
}

interface User {
  id: number;
  nom: string;
  prenom: string;
}

export default function Stats() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    totalUsers: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersResponse, usersResponse] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/users')
      ]);

      const orders: Order[] = await ordersResponse.json();
      const users: User[] = await usersResponse.json();

      const totalOrders = orders.length;
      const confirmedOrdersList = orders.filter(o => o.statut === 'confirmee');
      const totalRevenue = confirmedOrdersList.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = orders.filter(o => o.statut === 'en_attente').length;
      const confirmedOrders = confirmedOrdersList.length;
      const deliveredOrders = orders.filter(o => o.statut === 'livree').length;
      const totalUsers = users.length;
      const averageOrderValue = confirmedOrders > 0 ? totalRevenue / confirmedOrders : 0;

      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        totalUsers,
        averageOrderValue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const shopuff1 = (stats.totalRevenue * 0.573).toFixed(2);
  const shopuff2 = (stats.totalRevenue * 0.32).toFixed(2);
  const shopuff3 = (stats.totalRevenue * 0.107).toFixed(2);

  if (loading) {
    return (
      <AdminLayout title="📊 Statistiques" subtitle="Chargement en cours...">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p className="text-slate-300 ml-4">Chargement des statistiques...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="📊 Statistiques"
      subtitle="Analyse complète des performances de votre plateforme"
    >
      {/* Stats Grid */}
      <div className="admin-stats max-w-7xl mx-auto">
        <StatCard
          icon="📦"
          value={stats.totalOrders}
          label="Total Commandes"
          color="from-blue-500 to-cyan-500"
        />

        <StatCard
          icon="💰"
          value={`${stats.totalRevenue}€`}
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
          icon="✅"
          value={stats.confirmedOrders}
          label="Confirmées"
          color="from-green-500 to-teal-500"
        />

        <StatCard
          icon="🚚"
          value={stats.deliveredOrders}
          label="Livrées"
          color="from-purple-500 to-pink-500"
        />

        <StatCard
          icon="👥"
          value={stats.totalUsers}
          label="Utilisateurs"
          color="from-indigo-500 to-purple-500"
        />

        <StatCard
          icon="📈"
          value={`${stats.averageOrderValue.toFixed(2)}€`}
          label="Panier Moyen"
          color="from-cyan-500 to-blue-500"
        />

        {/* Shopuff Distribution */}
        <StatCard
          icon="🏆"
          value={`${shopuff1}€`}
          label="SHOPUFF1 (57.3%)"
          color="from-purple-500 to-pink-500"
          className="col-span-full md:col-span-1"
        />

        <StatCard
          icon="🥈"
          value={`${shopuff2}€`}
          label="SHOPUFF2 (32%)"
          color="from-blue-500 to-cyan-500"
          className="col-span-full md:col-span-1"
        />

        <StatCard
          icon="🥉"
          value={`${shopuff3}€`}
          label="SHOPUFF3 (10.7%)"
          color="from-green-500 to-emerald-500"
          className="col-span-full md:col-span-1"
        />
      </div>

      {/* Summary Card */}
      <div className="mt-12 max-w-4xl mx-auto">
        <AdminCard>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Résumé de Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {((stats.deliveredOrders / stats.totalOrders) * 100 || 0).toFixed(1)}%
              </div>
              <div className="text-slate-400">Taux de livraison</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {stats.totalRevenue.toFixed(0)}€
              </div>
              <div className="text-slate-400">Revenus totaux</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {stats.totalUsers}
              </div>
              <div className="text-slate-400">Clients actifs</div>
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}