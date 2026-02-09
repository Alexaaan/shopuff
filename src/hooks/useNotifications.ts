import { useState, useEffect, useCallback } from 'react';

interface NotificationStats {
  totalDevices: number;
  webDevices: number;
  mobileDevices: number;
  recentNotifications: number;
  successRate: number;
  totalSent: number;
  totalSuccess: number;
  totalFailed: number;
}

interface NotificationSettings {
  [key: string]: {
    value: string;
    description: string;
    updatedAt: string;
  };
}

interface NotificationLog {
  id: number;
  title: string;
  message: string;
  type: string;
  target_type: string;
  target_value: string | null;
  sent_by: number | null;
  devices_targeted: number;
  devices_success: number;
  devices_failed: number;
  created_at: string;
  users?: {
    nom: string;
    prenom: string;
    email?: string;
  };
}

interface SendNotificationData {
  title: string;
  message: string;
  type?: string;
  target?: 'all' | 'role' | 'user';
  targetValue?: string;
}

interface SendNotificationResponse {
  success: boolean;
  sent: number;
  failed: number;
  total: number;
  logId?: number;
  results: any[];
}

export function useNotifications() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Erreur chargement stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les paramètres
  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/settings');
      if (!response.ok) throw new Error('Erreur chargement paramètres');
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  }, []);

  // Charger l'historique des notifications
  const loadLogs = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications/logs?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Erreur chargement logs');
      const data = await response.json();
      setLogs(data.logs);
      return data.pagination;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Envoyer une notification
  const sendNotification = useCallback(async (data: SendNotificationData): Promise<SendNotificationResponse | null> => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur envoi notification');
      }

      const result = await response.json();
      // Recharger les stats après l'envoi
      await loadStats();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Mettre à jour les paramètres
  const updateSettings = useCallback(async (updates: Record<string, string>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Erreur mise à jour paramètres');

      // Recharger les paramètres
      await loadSettings();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadSettings]);

  // Charger les données initiales
  useEffect(() => {
    loadStats();
    loadSettings();
  }, [loadStats, loadSettings]);

  return {
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
    clearError: () => setError(null),
  };
}