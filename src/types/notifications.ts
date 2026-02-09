// Notification Types
export interface UserNotification {
  id: number;
  user_id: number;
  type: 'message' | 'order' | 'system' | 'promo' | 'admin';
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
}

export interface NotificationPreference {
  id: number;
  user_id: number;
  push_enabled: boolean;
  email_enabled: boolean;
  message_notifications: boolean;
  order_notifications: boolean;
  promo_notifications: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationCount {
  total: number;
  unread: number;
}

export interface CreateNotificationParams {
  userId: number;
  type: UserNotification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  sendPush?: boolean;
}

export interface SendNotificationResult {
  success: boolean;
  notificationId?: number;
  channels?: {
    fcm?: { success: boolean; count: number };
    websocket?: { success: boolean };
  };
  error?: string;
}
