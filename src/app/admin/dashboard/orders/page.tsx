'use client';

import { useState, useEffect } from 'react';

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
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Gestion des Commandes</h1>
      <table className="admin-orders-table">
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
              <td>{order.id}</td>
              <td>
                {order.users.prenom} {order.users.nom}
              </td>
              <td>
                {order.order_products.map((op, index) => (
                  <div key={index}>
                    {op.quantite}x {op.products.nom} ({op.prix_unitaire}€)
                  </div>
                ))}
              </td>
              <td>{order.total}€</td>
              <td>{order.statut}</td>
              <td>
                <select
                  value={order.payment_method || ''}
                  onChange={(e) => updateOrderPayment(order.id, e.target.value)}
                >
                  <option value="espece">Espèces</option>
                  <option value="carte_bleue">Carte bleue</option>
                </select>
              </td>
              <td>
                {new Date(order.debut_commande).toLocaleDateString()}
              </td>
              <td>
                {order.statut === 'en_attente' && (
                  <button onClick={() => updateOrderStatus(order.id, 'confirmee')}>
                    Valider
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}