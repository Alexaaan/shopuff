'use client';

import { useCallback } from 'react';
import { createNotification } from '@/services/notificationService';
import { useNotifications } from '@/lib/NotificationContext';

// Hook to create notifications from chat/order events
export function useNotificationCreator() {
  const { incrementUnread } = useNotifications();

  const notifyNewMessage = useCallback(async (params: {
    recipientUserId: number;
    senderName: string;
    orderId: number;
    messagePreview: string;
  }) => {
    const { recipientUserId, senderName, orderId, messagePreview } = params;

    try {
      await createNotification({
        userId: recipientUserId,
        type: 'message',
        title: `💬 Nouveau message de ${senderName}`,
        message: messagePreview.length > 100 ? messagePreview.substring(0, 100) + '...' : messagePreview,
        actionUrl: `/admin/dashboard/chats?orderId=${orderId}`
      });
      incrementUnread();
    } catch (error) {
      console.error('Error creating message notification:', error);
    }
  }, [incrementUnread]);

  const notifyOrderUpdate = useCallback(async (params: {
    userId: number;
    orderId: number;
    statusText: string;
  }) => {
    const { userId, orderId, statusText } = params;

    try {
      await createNotification({
        userId,
        type: 'order',
        title: '📦 Mise à jour de votre commande',
        message: `Votre commande #${orderId} est maintenant: ${statusText}`,
        actionUrl: `/user/orders/${orderId}`
      });
    } catch (error) {
      console.error('Error creating order notification:', error);
    }
  }, []);

  const notifyAdminNewOrder = useCallback(async (params: {
    adminUserIds: number[];
    orderId: number;
    customerName: string;
    total: number;
  }) => {
    const { adminUserIds, orderId, customerName, total } = params;

    for (const adminId of adminUserIds) {
      try {
        await createNotification({
          userId: adminId,
          type: 'order',
          title: '🛒 Nouvelle commande',
          message: `${customerName} a passé une commande de ${total}€`,
          actionUrl: `/admin/dashboard/orders?orderId=${orderId}`
        });
      } catch (error) {
        console.error('Error creating admin order notification:', error);
      }
    }
  }, []);

  return {
    notifyNewMessage,
    notifyOrderUpdate,
    notifyAdminNewOrder
  };
}
