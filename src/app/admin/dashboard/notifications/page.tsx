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
  const [activeTab, setActiveTab] = useState('overview');

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
      <div className="dashboard-header">
        <h1>🔔 Gestion des Notifications</h1>
        <p>Gérez les notifications push et automatiques</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <h3>Tokens FCM</h3>
            <p className="stat-number">0</p>
            <span className="stat-label">Devices enregistrés</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Envoyées</h3>
            <p className="stat-number">0</p>
            <span className="stat-label">Cette semaine</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <h3>Ouvertes</h3>
            <p className="stat-number">0%</p>
            <span className="stat-label">Taux d'ouverture</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>Échecs</h3>
            <p className="stat-number">0</p>
            <span className="stat-label">Tokens invalides</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </button>
        <button
          className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          Créer Notification
        </button>
        <button
          className={`tab-button ${activeTab === 'presets' ? 'active' : ''}`}
          onClick={() => setActiveTab('presets')}
        >
          Presets
        </button>
        <button
          className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Historique
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="settings-card">
              <h2>⚙️ Notifications Automatiques</h2>
              <div className="settings-grid">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>💬 Messages de commande</h4>
                    <p>Notifie quand un nouveau message est envoyé</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>📦 Changement de statut</h4>
                    <p>Notifie les changements de statut commande</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>❌ Annulation</h4>
                    <p>Notifie les annulations de commande</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="manual-section">
            <div className="form-card">
              <h2>📝 Créer Notification Manuelle</h2>
              <form className="notification-form">
                <div className="form-group">
                  <label>Titre</label>
                  <input type="text" placeholder="Titre de la notification" />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea placeholder="Contenu de la notification" rows={3}></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select>
                      <option value="info">ℹ️ Info</option>
                      <option value="warning">⚠️ Warning</option>
                      <option value="promo">🎉 Promo</option>
                      <option value="system">🔧 Système</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Cible</label>
                    <select>
                      <option value="all">🌍 Tous</option>
                      <option value="role">👥 Par rôle</option>
                      <option value="user">👤 Utilisateur spécifique</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary">Prévisualiser</button>
                  <button type="submit" className="btn-primary">📤 Envoyer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="presets-section">
            <div className="presets-grid">
              <div className="preset-card">
                <div className="preset-icon">💬</div>
                <h3>Nouveau message</h3>
                <p>Notification automatique pour nouveaux messages chat</p>
                <span className="preset-status active">Activé</span>
              </div>
              <div className="preset-card">
                <div className="preset-icon">✅</div>
                <h3>Commande confirmée</h3>
                <p>Confirmation de validation commande</p>
                <span className="preset-status active">Activé</span>
              </div>
              <div className="preset-card">
                <div className="preset-icon">❌</div>
                <h3>Commande annulée</h3>
                <p>Notification d'annulation commande</p>
                <span className="preset-status active">Activé</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-section">
            <div className="logs-card">
              <h2>📊 Historique des Notifications</h2>
              <div className="logs-filters">
                <select>
                  <option>Tous les statuts</option>
                  <option>Envoyées</option>
                  <option>Échouées</option>
                  <option>Ouvertes</option>
                </select>
                <input type="date" />
                <button className="btn-secondary">🔍 Filtrer</button>
              </div>
              <div className="logs-table-container">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Titre</th>
                      <th>Type</th>
                      <th>Statut</th>
                      <th>Plateforme</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-state">
                          Aucune notification envoyée récemment
                        </td>
                      </tr>
                    ) : (
                      notifications.map(notif => (
                        <tr key={notif.id}>
                          <td>#{notif.id}</td>
                          <td>{notif.title}</td>
                          <td>
                            <span className={`type-badge ${notif.type}`}>
                              {notif.type}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${notif.status}`}>
                              {notif.status}
                            </span>
                          </td>
                          <td>Web</td>
                          <td>{new Date(notif.created_at).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}