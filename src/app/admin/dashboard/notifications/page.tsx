'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  status: string;
  created_at: string;
}

interface Preset {
  id: number;
  name: string;
  title: string;
  message: string;
  type: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchPresets();
  }, []);

  const fetchNotifications = async () => {
    // Placeholder, need API
    setNotifications([]);
  };

  const fetchPresets = async () => {
    // Placeholder
    setPresets([]);
  };

  return (
    <div className="admin-dashboard">
      <h1>Gestion des Notifications</h1>

      <div className="notifications-sections">
        <section>
          <h2>Notifications Automatiques</h2>
          <div>
            <label>
              <input type="checkbox" defaultChecked /> Messages de commande
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" defaultChecked /> Changement de statut
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" defaultChecked /> Annulation
            </label>
          </div>
        </section>

        <section>
          <h2>Créer Notification Manuelle</h2>
          <form>
            <input type="text" placeholder="Titre" />
            <textarea placeholder="Message"></textarea>
            <select>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="promo">Promo</option>
            </select>
            <select>
              <option value="all">Tous</option>
              <option value="role">Rôle</option>
              <option value="user">Utilisateur</option>
            </select>
            <button type="submit">Envoyer</button>
          </form>
        </section>

        <section>
          <h2>Presets</h2>
          <ul>
            <li>Nouveau message</li>
            <li>Commande confirmée</li>
            <li>Commande annulée</li>
          </ul>
        </section>

        <section>
          <h2>Logs</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(notif => (
                <tr key={notif.id}>
                  <td>{notif.id}</td>
                  <td>{notif.title}</td>
                  <td>{notif.status}</td>
                  <td>{new Date(notif.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}