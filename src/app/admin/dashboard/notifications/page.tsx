'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import NotificationManager from '@/components/admin/NotificationManager';

export default function Notifications() {
  return (
    <AdminLayout
      title="🔔 Notifications"
      subtitle="Gérer et envoyer des notifications push aux utilisateurs"
    >
      <NotificationManager />
    </AdminLayout>
  );
}