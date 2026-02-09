// Notification Service - Frontend API calls
import { UserNotification } from '@/types/notifications';

const API_BASE = '/api/notifications';

export interface NotificationResponse {
  notifications: UserNotification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchNotifications(params: {
  userId: number;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<NotificationResponse> {
  const { userId, page = 1, limit = 20, unreadOnly = false } = params;
  
  const searchParams = new URLSearchParams({
    userId: userId.toString(),
    page: page.toString(),
    limit: limit.toString(),
    ...(unreadOnly && { unreadOnly: 'true' })
  });

  const response = await fetch(`${API_BASE}/user?${searchParams}`);
  
  if (!response.ok) {
    throw new Error('Erreur récupération notifications');
  }
  
  return response.json();
}

export async function getUnreadCount(userId: number): Promise<number> {
  const response = await fetch(`${API_BASE}/count?userId=${userId}`);
  
  if (!response.ok) {
    throw new Error('Erreur comptage notifications');
  }
  
  const data = await response.json();
  return data.unreadCount;
}

export async function createNotification(params: {
  userId: number;
  type: UserNotification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
}): Promise<UserNotification> {
  const response = await fetch(`${API_BASE}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  if (!response.ok) {
    throw new Error('Erreur création notification');
  }
  
  const data = await response.json();
  return data.notification;
}

export async function markAsRead(params: {
  notificationId?: number;
  userId: number;
  markAllAsRead?: boolean;
}): Promise<{ success: boolean; updated: 'single' | 'all' }> {
  const response = await fetch(`${API_BASE}/user`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  if (!response.ok) {
    throw new Error('Erreur mise à jour notification');
  }
  
  return response.json();
}

export async function deleteNotification(params: {
  id: number;
  userId: number;
}): Promise<{ success: boolean }> {
  const searchParams = new URLSearchParams({
    id: params.id.toString(),
    userId: params.userId.toString()
  });
  
  const response = await fetch(`${API_BASE}/user?${searchParams}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Erreur suppression notification');
  }
  
  return response.json();
}

// Broadcast notification to multiple users (admin function)
export async function broadcastNotification(params: {
  userIds: number[];
  type: UserNotification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
}): Promise<{ success: boolean; sent: number; failed: number }> {
  const response = await fetch(`${API_BASE}/user/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  if (!response.ok) {
    throw new Error('Erreur broadcast notification');
  }
  
  return response.json();
}
