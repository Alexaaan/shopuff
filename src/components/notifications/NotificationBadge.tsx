'use client';

import { useNotifications } from '@/lib/NotificationContext';

interface NotificationBadgeProps {
  className?: string;
  showZero?: boolean;
}

export function NotificationBadge({ className = '', showZero = false }: NotificationBadgeProps) {
  const { unreadCount } = useNotifications();

  if (!showZero && unreadCount === 0) {
    return null;
  }

  return (
    <span className={`notification-badge ${className}`}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
