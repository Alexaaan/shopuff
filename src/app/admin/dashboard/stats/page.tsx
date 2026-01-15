'use client';

import { useState, useEffect } from 'react';

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

  if (loading) return <div>Loading...</div>;

  const shopuff1 = (stats.totalRevenue * 0.573).toFixed(2);
  const shopuff2 = (stats.totalRevenue * 0.32).toFixed(2);
  const shopuff3 = (stats.totalRevenue * 0.107).toFixed(2);

  return (
    <div className="admin-dashboard">
      <h1>Statistiques</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Commandes</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Chiffre d'Affaires Total</h3>
          <p className="stat-value">{stats.totalRevenue}€</p>
        </div>
        <div className="stat-card">
          <h3>Commandes en Attente</h3>
          <p className="stat-value">{stats.pendingOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Commandes Confirmées</h3>
          <p className="stat-value">{stats.confirmedOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Commandes Livrées</h3>
          <p className="stat-value">{stats.deliveredOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Utilisateurs</h3>
          <p className="stat-value">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Valeur Moyenne Commande</h3>
          <p className="stat-value">{stats.averageOrderValue.toFixed(2)}€</p>
        </div>
        <div className="stat-card">
          <h3>SHOPUFF1 (57.3%)</h3>
          <p className="stat-value">{shopuff1}€</p>
        </div>
        <div className="stat-card">
          <h3>SHOPUFF2 (32%)</h3>
          <p className="stat-value">{shopuff2}€</p>
        </div>
        <div className="stat-card">
          <h3>SHOPUFF3 (10.7%)</h3>
          <p className="stat-value">{shopuff3}€</p>
        </div>
      </div>
    </div>
  );
}