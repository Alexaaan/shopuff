'use client';

import { useState, useEffect } from 'react';

interface Order {
  id: number;
  total: number;
  statut: string;
  debut_commande: string;
}

export default function Stats() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/orders');
      const orders: Order[] = await response.json();

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = orders.filter(o => o.statut === 'en_attente').length;
      const confirmedOrders = orders.filter(o => o.statut === 'confirmee').length;
      const deliveredOrders = orders.filter(o => o.statut === 'livree').length;

      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Statistiques</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ border: '1px solid #ddd', padding: '20px', textAlign: 'center' }}>
          <h3>Total Commandes</h3>
          <p style={{ fontSize: '2em' }}>{stats.totalOrders}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '20px', textAlign: 'center' }}>
          <h3>Chiffre d'Affaires Total</h3>
          <p style={{ fontSize: '2em' }}>{stats.totalRevenue}€</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '20px', textAlign: 'center' }}>
          <h3>Commandes en Attente</h3>
          <p style={{ fontSize: '2em' }}>{stats.pendingOrders}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '20px', textAlign: 'center' }}>
          <h3>Commandes Confirmées</h3>
          <p style={{ fontSize: '2em' }}>{stats.confirmedOrders}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '20px', textAlign: 'center' }}>
          <h3>Commandes Livrées</h3>
          <p style={{ fontSize: '2em' }}>{stats.deliveredOrders}</p>
        </div>
      </div>
    </div>
  );
}