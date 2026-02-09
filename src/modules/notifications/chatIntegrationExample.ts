/**
 * EXEMPLE D'INTÉGRATION - Notification lors d'un nouveau message
 * 
 * Ce fichier montre comment intégrer le système de notifications
 * dans la route API des messages existante.
 * 
 * Fichier à modifier: src/app/api/messages/route.ts
 */

// === AVANT: Code existant (ligne ~108) ===
/*
// Get order details to determine recipient
const { data: order, error: orderError } = await supabase
  .from('orders')
  .select('utilisateur_id, vendeur_id')
  .eq('id', order_id)
  .single();
*/

// === APRÈS: Avec notifications ===
/*
import { createNotification, getUnreadCount } from '@/services/notificationService';

// ... après avoir inséré le message ...

// Get order details to determine recipient
const { data: order, error: orderError } = await supabase
  .from('orders')
  .select('utilisateur_id, vendeur_id')
  .eq('id', order_id)
  .single();

if (orderError || !order) {
  return NextResponse.json({ success: true, message: data });
}

// Déterminer le destinataire (si l'expéditeur est le client, envoyer à l'admin, et vice versa)
const senderId = user_id;
let recipientId: number | null = null;

if (senderId === order.utilisateur_id && order.vendeur_id) {
  recipientId = order.vendeur_id;
} else if (senderId === order.vendeur_id) {
  recipientId = order.utilisateur_id;
}

// Créer une notification pour le destinataire
if (recipientId) {
  const senderName = sender ? `${sender.prenom} ${sender.nom}` : 'Client';
  
  await createNotification({
    userId: recipientId,
    type: 'message',
    title: `💬 Nouveau message de ${senderName}`,
    message: message.length > 100 ? message.substring(0, 100) + '...' : message,
    actionUrl: senderId === order.utilisateur_id 
      ? `/user/chats?orderId=${order_id}`
      : `/admin/dashboard/chats?orderId=${order_id}`
  });
  
  console.log(`[Notifications] Notification created for user ${recipientId}`);
}
*/

// === INTÉGRATION DANS LE CHAT COMPONENT ===
/*
// Dans ChatPage.tsx ou le composant de chat
import { NotificationProvider } from '@/lib/NotificationContext';
import { NotificationBell } from '@/components/notifications';

// Wrap your app with NotificationProvider
/*
<NotificationProvider userId={user?.id}>
  <YourAppContent />
</NotificationProvider>
*/

/*
// Dans votre Header ou component de navigation:
import { NotificationBell } from '@/components/notifications';

function Header() {
  return (
    <header>
      <NotificationBell />
    </header>
  );
}
*/

// === UTILISATION DU HOOK DE CRÉATION ===
/*
// Dans un composant React
import { useNotificationCreator } from '@/hooks/useNotificationCreator';

function MyComponent() {
  const { notifyNewMessage, notifyOrderUpdate } = useNotificationCreator();

  const handleMessage = async () => {
    // Appeler lors de la réception d'un nouveau message
    await notifyNewMessage({
      recipientUserId: adminId,
      senderName: 'Jean Dupont',
      orderId: 123,
      messagePreview: 'Bonjour, j\'ai une question sur ma commande...'
    });
  };

  const handleOrderUpdate = async () => {
    await notifyOrderUpdate({
      userId: customerId,
      orderId: 456,
      statusText: 'En préparation'
    });
  };

  return (
    <button onClick={handleMessage}>Tester notification</button>
  );
}
*/

// === CONFIGURATION WEBSOCKET (optionnel) ===
/*
// Dans votre layout ou provider principal
import { useNotificationsRealtime } from '@/hooks/useNotificationsRealtime';

function AppProviders({ children }) {
  const userId = useAuth().user?.id;
  
  useNotificationsRealtime({ 
    userId, 
    enabled: true 
  });

  return <>{children}</>;
}
*/
