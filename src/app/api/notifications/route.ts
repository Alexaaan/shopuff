import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import admin from 'firebase-admin';

interface NotificationLog {
  devices_targeted: number;
  devices_success: number;
  devices_failed: number;
  created_at: string;
}

interface Device {
  id: number;
  platform: string;
  is_active: boolean;
  created_at: string;
}

export async function GET() {
  try {
    const supabase = await getSupabase();

    // Récupérer les statistiques des devices
    const { data: devices, error: devicesError } = await supabase
      .from('user_devices')
      .select('id, platform, is_active, created_at')
      .eq('is_active', true);

    if (devicesError) {
      console.error('Error fetching devices:', devicesError);
    }

    // Récupérer les statistiques des notifications depuis les campagnes
    let campaigns = [];
    try {
      const result = await supabase
        .from('notification_campaigns')
        .select('devices_targeted, devices_success, devices_failed, created_at')
        .order('created_at', { ascending: false })
        .limit(100); // Derniers 100 campagnes

      campaigns = result.data || [];
      if (result.error) {
        console.log('Table notification_campaigns does not exist yet. Stats will show zeros.');
      }
    } catch (err) {
      console.log('Table notification_campaigns does not exist yet. Stats will show zeros.');
      campaigns = [];
    }

    // Calculer les statistiques
    const totalSent = (campaigns as NotificationLog[])?.reduce((sum: number, log: NotificationLog) => sum + (log.devices_targeted || 0), 0) || 0;
    const totalSuccess = (campaigns as NotificationLog[])?.reduce((sum: number, log: NotificationLog) => sum + (log.devices_success || 0), 0) || 0;
    const totalFailed = (campaigns as NotificationLog[])?.reduce((sum: number, log: NotificationLog) => sum + (log.devices_failed || 0), 0) || 0;

    const successRate = totalSent > 0 ? Math.round((totalSuccess / totalSent) * 100) : 0;

    // Notifications récentes (dernières 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCampaigns = (campaigns as NotificationLog[])?.filter((log: NotificationLog) => new Date(log.created_at) > oneDayAgo) || [];
    const recentNotifications = recentCampaigns.reduce((sum: number, log: NotificationLog) => sum + (log.devices_targeted || 0), 0);

    const stats = {
      totalDevices: devices?.length || 0,
      webDevices: (devices as Device[])?.filter((d: Device) => d.platform === 'web').length || 0,
      mobileDevices: (devices as Device[])?.filter((d: Device) => d.platform !== 'web').length || 0,
      recentNotifications,
      successRate,
      totalSent,
      totalSuccess,
      totalFailed
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { title, message, type, target, targetValue } = await request.json();

    console.log('Sending notification:', { title, message, type, target, targetValue });

    if (!title || !message) {
      return NextResponse.json({ error: 'Titre et message requis' }, { status: 400 });
    }

    // Déterminer les devices cibles
    let deviceQuery = supabase
      .from('user_devices')
      .select('device_token, platform, user_id, users!inner(role, is_active)')
      .eq('is_active', true);

    if (target === 'role') {
      deviceQuery = deviceQuery.eq('users.role', targetValue);
    } else if (target === 'user') {
      const userId = parseInt(targetValue);
      console.log('Targeting user ID:', userId, 'from targetValue:', targetValue);
      if (isNaN(userId)) {
        return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 400 });
      }
      deviceQuery = deviceQuery.eq('user_id', userId);
    }
    // Pour 'all', pas de filtre supplémentaire

    const { data: targetDevices, error: devicesError } = await deviceQuery;

    console.log('Target devices query result:', { targetDevices, devicesError });

    if (devicesError) {
      console.error('Error fetching target devices:', devicesError);
      return NextResponse.json({ error: 'Erreur récupération devices' }, { status: 500 });
    }

    if (!targetDevices || targetDevices.length === 0) {
      return NextResponse.json({ error: 'Aucun device cible trouvé' }, { status: 400 });
    }

    // Initialiser Firebase Admin
    console.log('Initializing Firebase Admin...');
    if (!admin.apps.length) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
        console.log('Firebase service account loaded:', !!serviceAccount.project_id);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin initialized successfully');
      } catch (firebaseError) {
        console.error('Error initializing Firebase:', firebaseError);
        return NextResponse.json({ error: 'Erreur configuration Firebase' }, { status: 500 });
      }
    }

    // Créer la notification
    const notificationMessage = {
      notification: {
        title: title,
        body: message,
      },
      data: {
        type: type || 'manual',
        sentAt: new Date().toISOString(),
      },
    };

    console.log('Sending to', targetDevices.length, 'devices');

    // Envoyer à tous les devices cibles
    const sendPromises = targetDevices.map((device: any) =>
      admin.messaging().send({
        ...notificationMessage,
        token: device.device_token,
      }).then(() => ({
        token: device.device_token,
        success: true,
        userId: device.user_id
      })).catch((err: any) => {
        console.error('Error sending to device:', device.device_token, err.message);
        return {
          token: device.device_token,
          success: false,
          error: err.message,
          userId: device.user_id
        };
      })
    );

    const results = await Promise.all(sendPromises);
    console.log('Send results:', results);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    // Sauvegarder les résultats dans la table notification_campaigns
    let campaignData = null;
    try {
      const result = await supabase
        .from('notification_campaigns')
        .insert({
          title,
          message,
          type: type || 'manual',
          target_type: target || 'all',
          target_value: targetValue,
          devices_targeted: results.length,
          devices_success: successCount,
          devices_failed: failureCount
        })
        .select()
        .single();

      campaignData = result.data;
      if (result.error) {
        console.log('Table notification_campaigns does not exist yet. Campaign not saved.');
      }
    } catch (err) {
      console.log('Table notification_campaigns does not exist yet. Campaign not saved.');
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failureCount,
      total: results.length,
      campaignId: campaignData?.id,
      results: results
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Erreur envoi notification' }, { status: 500 });
  }
}