import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "shopu-d287a",
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        client_id,
        message,
        created_at,
        user_id,
        read_at,
        users (
          id,
          nom,
          prenom
        )
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { order_id, user_id, message, is_chat_open, client_id } = await request.json();

    if (!order_id || !user_id || !message) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    // Check for duplicate by client_id (deduplication)
    if (client_id) {
      const { data: existing } = await supabase
        .from('messages')
        .select('id')
        .eq('client_id', client_id)
        .single();
      
      if (existing) {
        console.log('Duplicate message detected, skipping:', client_id);
        return NextResponse.json({ success: true, duplicate: true, message: existing });
      }
    }

    // Insert message with client_id for deduplication
    const { data, error } = await supabase
      .from('messages')
      .insert({
        order_id,
        user_id,
        message,
        client_id: client_id || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json({ error: 'Erreur création message' }, { status: 500 });
    }

    // Update presence if chat is open
    if (is_chat_open) {
      await supabase
        .from('chat_presence')
        .upsert({
          user_id,
          order_id,
          last_seen_at: new Date().toISOString(),
          is_active: true
        }, { onConflict: 'user_id,order_id' });
    }

    // Get order details to determine recipient
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('utilisateur_id, vendeur_id')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return NextResponse.json({ success: true, message: data });
    }

    // Get the sender's info
    const { data: sender } = await supabase
      .from('users')
      .select('prenom, nom')
      .eq('id', user_id)
      .single();
    
    const senderName = sender ? `${sender.prenom} ${sender.nom}` : 'Client';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shopuff.vercel.app';

    // Get all admin users who should receive notifications
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin');

    const adminIds = admins?.map((a: { id: number }) => a.id) || [];

    // Send notification to ALL admins (if not active in chat)
    if (adminIds.length > 0) {
      for (const adminUser of admins) {
        if (adminUser.id === user_id) continue;

        // Check if admin is active in ANY chat (not just this one)
        const { data: presence } = await supabase
          .from('chat_presence')
          .select('id')
          .eq('user_id', adminUser.id)
          .eq('is_active', true)
          .single();

        if (presence) {
          // Admin is active somewhere, skip notification
          continue;
        }

        // Create notification for admin
        const { data: notif, error: notifError } = await supabase
          .from('notifications')
          .insert({
            title: '💬 Réponse client',
            message: `${senderName}: ${message.length > 80 ? message.substring(0, 80) + '...' : message}`,
            type: 'info',
            action_url: `/admin/dashboard/chats?orderId=${order_id}`,
            status: 'sent',
            sent_at: new Date().toISOString(),
            created_by: user_id
          })
          .select()
          .single();

        if (notifError) {
          console.error('Error creating admin notification:', notifError);
          continue;
        }

        await supabase
          .from('notification_targets')
          .insert({
            notification_id: notif.id,
            target_type: 'user',
            target_value: adminUser.id.toString()
          });

        // Send FCM push to admin
        const { data: devices } = await supabase
          .from('user_devices')
          .select('device_token, platform')
          .eq('user_id', adminUser.id)
          .eq('is_active', true);

        if (devices && devices.length > 0) {
          const chatUrl = `${siteUrl}/admin/dashboard/chats?orderId=${order_id}`;
          
          for (const device of devices) {
            try {
              const fcmMessage = {
                token: device.device_token,
                notification: {
                  title: `💬 Commande #${order_id}`,
                  body: `${senderName}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
                },
                webpush: {
                  notification: {
                    title: `💬 Commande #${order_id}`,
                    body: `${senderName}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
                    icon: '/logo.png',
                    badge: '/logo.png',
                    tag: `chat-${order_id}-${user_id}`,
                    data: {
                      order_id: order_id.toString(),
                      message_id: data.id.toString(),
                      sender_id: user_id.toString(),
                      type: 'chat_message',
                      target_url: `/admin/dashboard/chats?orderId=${order_id}`
                    },
                    actions: [
                      { action: 'open', title: '🗨️ Ouvrir' }
                    ]
                  },
                  fcmOptions: { link: chatUrl }
                },
                data: {
                  order_id: order_id.toString(),
                  message_id: data.id.toString(),
                  sender_id: user_id.toString(),
                  type: 'chat_message',
                  target_url: `/admin/dashboard/chats?orderId=${order_id}`
                }
              };

              await admin.messaging().send(fcmMessage);

              await supabase
                .from('notification_logs')
                .insert({
                  notification_id: notif.id,
                  user_id: adminUser.id,
                  device_token: device.device_token,
                  platform: device.platform,
                  status: 'sent'
                });

            } catch (fcmError: any) {
              console.error('FCM error for admin:', fcmError.message);
              await supabase
                .from('notification_logs')
                .insert({
                  notification_id: notif.id,
                  user_id: adminUser.id,
                  device_token: device.device_token,
                  platform: device.platform,
                  status: 'failed',
                  error_message: fcmError.message || 'FCM send failed'
                });
            }
          }
        }
      }
    }

    // Also notify the recipient (user or vendor) if they're not active
    const recipient_id = user_id === order.utilisateur_id ? order.vendeur_id : order.utilisateur_id;
    
    if (recipient_id && !adminIds.includes(recipient_id)) {
      // Check if recipient is active in ANY chat
      const { data: presence } = await supabase
        .from('chat_presence')
        .select('id')
        .eq('user_id', recipient_id)
        .eq('is_active', true)
        .single();

      if (!presence) {
        const { data: notif, error: notifError } = await supabase
          .from('notifications')
          .insert({
            title: 'Nouveau message',
            message: message.length > 80 ? message.substring(0, 80) + '...' : message,
            type: 'info',
            action_url: `/user/chats?orderId=${order_id}`,
            status: 'sent',
            sent_at: new Date().toISOString(),
            created_by: user_id
          })
          .select()
          .single();

        if (!notifError) {
          await supabase
            .from('notification_targets')
            .insert({
              notification_id: notif.id,
              target_type: 'user',
              target_value: recipient_id.toString()
            });

          const { data: devices } = await supabase
            .from('user_devices')
            .select('device_token, platform')
            .eq('user_id', recipient_id)
            .eq('is_active', true);

          if (devices && devices.length > 0) {
            const chatUrl = `${siteUrl}/user/chats?orderId=${order_id}`;
            
            for (const device of devices) {
              try {
                const fcmMessage = {
                  token: device.device_token,
                  notification: {
                    title: `Commande #${order_id}`,
                    body: `${senderName}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
                  },
                  webpush: {
                    notification: {
                      title: `Commande #${order_id}`,
                      body: `${senderName}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
                      icon: '/logo.png',
                      badge: '/logo.png',
                      tag: `chat-${order_id}-${user_id}`,
                      data: {
                        order_id: order_id.toString(),
                        message_id: data.id.toString(),
                        sender_id: user_id.toString(),
                        type: 'chat_message',
                        target_url: `/user/chats?orderId=${order_id}`
                      },
                      actions: [
                        { action: 'open', title: '🗨️ Ouvrir' }
                      ]
                    },
                    fcmOptions: { link: chatUrl }
                  },
                  data: {
                    order_id: order_id.toString(),
                    message_id: data.id.toString(),
                    sender_id: user_id.toString(),
                    type: 'chat_message',
                    target_url: `/user/chats?orderId=${order_id}`
                  }
                };

                await admin.messaging().send(fcmMessage);

                await supabase
                  .from('notification_logs')
                  .insert({
                    notification_id: notif.id,
                    user_id: recipient_id,
                    device_token: device.device_token,
                    platform: device.platform,
                    status: 'sent'
                  });

              } catch (fcmError: any) {
                console.error('FCM error:', fcmError.message);
                await supabase
                  .from('notification_logs')
                  .insert({
                    notification_id: notif.id,
                    user_id: recipient_id,
                    device_token: device.device_token,
                    platform: device.platform,
                    status: 'failed',
                    error_message: fcmError.message || 'FCM send failed'
                  });
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: data });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}