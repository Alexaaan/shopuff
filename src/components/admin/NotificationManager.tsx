'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationManagerProps {
  className?: string;
}

export default function NotificationManager({ className }: NotificationManagerProps) {
  const {
    stats,
    settings,
    logs,
    loading,
    error,
    loadStats,
    loadSettings,
    loadLogs,
    sendNotification,
    updateSettings,
    clearError,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'settings' | 'stats'>('stats');
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all',
    targetValue: '',
  });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

  // Charger les logs au montage
  useEffect(() => {
    if (activeTab === 'history') {
      loadLogs();
    }
  }, [activeTab, loadLogs]);

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      alert('Titre et message sont requis');
      return;
    }

    setSending(true);
    const result = await sendNotification({
      title: notificationForm.title,
      message: notificationForm.message,
      type: notificationForm.type,
      target: notificationForm.target as 'all' | 'role' | 'user',
      targetValue: notificationForm.targetValue || undefined,
    });

    if (result) {
      setSendResult(result);
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
        targetValue: '',
      });
    }
    setSending(false);
  };

  const handleSettingChange = async (key: string, value: boolean) => {
    await updateSettings({ [key]: value.toString() });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'promo': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'order': return 'bg-purple-100 text-purple-800';
      case 'message': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTargetLabel = (targetType: string, targetValue?: string | null) => {
    switch (targetType) {
      case 'all': return 'Tous les utilisateurs';
      case 'role': return `Rôle: ${targetValue}`;
      case 'user': return `Utilisateur ID: ${targetValue}`;
      default: return targetType;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Onglets Modernes */}
      <div className="flex flex-wrap gap-2 bg-slate-800/50 backdrop-blur-xl p-2 rounded-2xl border border-slate-700/50">
        {[
          { id: 'stats', label: '📊 Statistiques', color: 'from-blue-500 to-cyan-500' },
          { id: 'send', label: '📤 Envoyer', color: 'from-green-500 to-emerald-500' },
          { id: 'history', label: '📋 Historique', color: 'from-purple-500 to-pink-500' },
          { id: 'settings', label: '⚙️ Paramètres', color: 'from-orange-500 to-red-500' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-purple-500/25 transform scale-105`
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl"></div>
            )}
          </button>
        ))}
      </div>

      {/* Erreur globale */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-red-300 font-medium">Erreur</p>
                <p className="text-red-200 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 transition-colors text-xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Onglet Statistiques */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card group">
            <div className="text-4xl mb-2">📱</div>
            <div className="stat-value">{stats?.totalDevices || 0}</div>
            <div className="stat-label">Total Devices</div>
            <div className="text-xs text-slate-400 mt-2">
              {stats?.webDevices || 0} web, {stats?.mobileDevices || 0} mobile
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
          </div>

          <div className="stat-card group">
            <div className="text-4xl mb-2">🎯</div>
            <div className="stat-value">{stats?.successRate || 0}%</div>
            <div className="stat-label">Taux de succès</div>
            <div className="text-xs text-slate-400 mt-2">
              {stats?.totalSuccess || 0} réussis / {stats?.totalSent || 0} envoyés
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
          </div>

          <div className="stat-card group">
            <div className="text-4xl mb-2">🔔</div>
            <div className="stat-value">{stats?.recentNotifications || 0}</div>
            <div className="stat-label">Notifications récentes</div>
            <div className="text-xs text-slate-400 mt-2">Dernières 24h</div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
          </div>

          <div className="stat-card group">
            <div className="text-4xl mb-2">❌</div>
            <div className="stat-value text-red-400">{stats?.totalFailed || 0}</div>
            <div className="stat-label">Échecs</div>
            <div className="text-xs text-slate-400 mt-2">Total des échecs</div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
          </div>
        </div>
      )}

      {/* Onglet Envoyer */}
      {activeTab === 'send' && (
        <div className="admin-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">📤</span>
            Envoyer une notification
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Titre</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de la notification"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                <select
                  className="admin-form-input"
                  value={notificationForm.type}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="info">ℹ️ Information</option>
                  <option value="warning">⚠️ Avertissement</option>
                  <option value="promo">🎉 Promotion</option>
                  <option value="system">🔧 Système</option>
                  <option value="order">📦 Commande</option>
                  <option value="message">💬 Message</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
              <textarea
                className="admin-form-input resize-none"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Contenu de la notification"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cible</label>
                <select
                  className="admin-form-input"
                  value={notificationForm.target}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, target: e.target.value, targetValue: '' }))}
                >
                  <option value="all">🌍 Tous les utilisateurs</option>
                  <option value="role">👥 Par rôle</option>
                  <option value="user">👤 Utilisateur spécifique</option>
                </select>
              </div>

              {(notificationForm.target === 'role' || notificationForm.target === 'user') && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {notificationForm.target === 'role' ? 'Rôle' : 'ID Utilisateur'}
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={notificationForm.targetValue}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, targetValue: e.target.value }))}
                    placeholder={notificationForm.target === 'role' ? 'admin/user' : 'ID utilisateur'}
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleSendNotification}
              disabled={sending || !notificationForm.title || !notificationForm.message}
              className="admin-btn w-full flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="admin-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <span className="text-xl">📤</span>
                  Envoyer la notification
                </>
              )}
            </button>

            {sendResult && (
              <div className={`p-4 rounded-lg border ${
                sendResult.success
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                <p className="flex items-center gap-2">
                  <span className="text-xl">{sendResult.success ? '✅' : '❌'}</span>
                  {sendResult.success
                    ? `Notification envoyée avec succès: ${sendResult.sent} réussis, ${sendResult.failed} échecs`
                    : 'Erreur lors de l\'envoi'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Onglet Historique */}
      {activeTab === 'history' && (
        <div className="admin-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">📋</span>
            Historique des notifications
          </h2>

          {loading ? (
            <div className="admin-loading">
              <div className="admin-spinner"></div>
              <p className="text-slate-300 ml-4">Chargement de l'historique...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-slate-400 text-lg">Aucune notification envoyée</p>
              <p className="text-slate-500 text-sm mt-2">Les notifications apparaîtront ici une fois envoyées</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="font-semibold text-white text-lg">{log.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                          {log.type}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-4 leading-relaxed">{log.message}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          🎯 {getTargetLabel(log.target_type, log.target_value)}
                        </span>
                        <span className="flex items-center gap-1">
                          📅 {formatDate(log.created_at)}
                        </span>
                        {log.users && (
                          <span className="flex items-center gap-1">
                            👤 {log.users.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {log.devices_success}/{log.devices_targeted}
                      </div>
                      <div className="text-sm text-slate-400">réussis</div>
                      {log.devices_failed > 0 && (
                        <div className="text-sm text-red-400 mt-1">
                          {log.devices_failed} échecs
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Onglet Paramètres */}
      {activeTab === 'settings' && (
        <div className="admin-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">⚙️</span>
            Paramètres des notifications
          </h2>

          <div className="space-y-8">
            {settings && Object.entries(settings).map(([key, setting]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex-1">
                  <label className="text-lg font-medium text-white capitalize cursor-pointer">
                    {key.replace(/_/g, ' ')}
                  </label>
                  {setting.description && (
                    <p className="text-slate-400 text-sm mt-1">{setting.description}</p>
                  )}
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={setting.value === 'true'}
                    onChange={(e) => handleSettingChange(key, e.target.checked)}
                  />
                  <div className="w-14 h-7 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 shadow-lg"></div>
                </label>
              </div>
            ))}

            {(!settings || Object.keys(settings).length === 0) && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚙️</div>
                <p className="text-slate-400 text-lg">Aucun paramètre disponible</p>
                <p className="text-slate-500 text-sm mt-2">Les paramètres apparaîtront ici une fois la migration effectuée</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}