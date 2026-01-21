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
        message,
        created_at,
        user_id,
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
    const { order_id, user_id, message, is_chat_open } = await request.json();

    if (!order_id || !user_id || !message) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    // Insert message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        order_id,
        user_id,
        message
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

    const recipient_id = user_id === order.utilisateur_id ? order.vendeur_id : order.utilisateur_id;

    if (!recipient_id) {
      return NextResponse.json({ success: true, message: data });
    }

    // Check if recipient is active in chat
    const { data: presence } = await supabase
      .from('chat_presence')
      .select('id')
      .eq('user_id', recipient_id)
      .eq('order_id', order_id)
      .eq('is_active', true)
      .single();

    if (presence) {
      // User is active, no notification
      return NextResponse.json({ success: true, message: data });
    }

    // Check cooldown: no notification for this order in last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
    const { data: recentNotif } = await supabase
      .from('notifications')
      .select('id')
      .eq('action_url', `/orders/${order_id}/chat`)
      .gte('created_at', thirtySecondsAgo)
      .limit(1);

    if (recentNotif && recentNotif.length > 0) {
      // Cooldown active
      return NextResponse.json({ success: true, message: data });
    }

    // Create notification
    const { data: notif, error: notifError } = await supabase
      .from('notifications')
      .insert({
        title: 'Nouveau message',
        message: message.length > 100 ? message.substring(0, 100) + '...' : message,
        type: 'info',
        action_url: `/orders/${order_id}/chat`,
        status: 'sent',
        sent_at: new Date().toISOString(),
        created_by: user_id // or admin id, but for now user_id
      })
      .select()
      .single();

    if (notifError) {
      console.error('Error creating notification:', notifError);
      return NextResponse.json({ success: true, message: data });
    }

    // Create target
    await supabase
      .from('notification_targets')
      .insert({
        notification_id: notif.id,
        target_type: 'user',
        target_value: recipient_id.toString()
      });

    // Send FCM push
    const { data: devices } = await supabase
      .from('user_devices')
      .select('device_token, platform')
      .eq('user_id', recipient_id)
      .eq('is_active', true);

    if (devices && devices.length > 0) {
      // Send to FCM using Firebase Admin
      for (const device of devices) {
        try {
          const message = {
            token: device.device_token,
            notification: {
              title: `Commande #${order_id}`,
              body: `Nouveau message`,
            },
            webpush: {
              fcmOptions: {
                link: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://shopuff.vercel.app'}/orders/${order_id}/chat`
              }
            },
            data: {
              order_id: order_id.toString(),
              type: 'chat'
            }
          };

          const response = await admin.messaging().send(message);

          // Log success
          await supabase
            .from('notification_logs')
            .insert({
              notification_id: notif.id,
              user_id: recipient_id,
              device_token: device.device_token,
              platform: device.platform,
              status: 'sent'
            });

          console.log('FCM sent successfully:', response);
        } catch (fcmError: any) {
          console.error('FCM error:', fcmError);
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

    return NextResponse.json({ success: true, message: data });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}