import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

interface DeliveryLog {
  id: number;
  notification_id: number;
  user_id: number;
  device_token: string;
  platform: string;
  status: string;
  error_message: string | null;
  sent_at: string;
  opened_at: string | null;
  users?: {
    name: string;
    email: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    console.log('🔍 Fetching delivery logs from notification_logs table...');

    // D'abord, testons une requête simple pour voir si la table est accessible
    const { data: testData, error: testError } = await supabase
      .from('notification_logs')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Table notification_logs not accessible:', testError);
      return NextResponse.json({
        error: 'Table notification_logs inaccessible',
        details: testError.message,
        logs: [],
        stats: { total: 0, sent: 0, failed: 0, opened: 0, pending: 0 },
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
      });
    }

    console.log('✅ Table accessible, fetching delivery logs...');

    // Récupérer les logs détaillés de livraison des notifications
    const { data: deliveryLogs, error, count } = await supabase
      .from('notification_logs')
      .select(`
        id,
        notification_id,
        user_id,
        device_token,
        platform,
        status,
        error_message,
        sent_at,
        opened_at
      `, { count: 'exact' })
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching delivery logs:', error);
      return NextResponse.json({
        error: 'Erreur récupération logs livraison',
        details: error.message,
        logs: [],
        stats: { total: 0, sent: 0, failed: 0, opened: 0, pending: 0 },
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
      });
    }

    console.log(`✅ Found ${deliveryLogs?.length || 0} delivery logs`);

    // Statistiques de livraison
    const stats = {
      total: count || 0,
      sent: (deliveryLogs as DeliveryLog[])?.filter((log: DeliveryLog) => log.status === 'sent').length || 0,
      failed: (deliveryLogs as DeliveryLog[])?.filter((log: DeliveryLog) => log.status === 'failed').length || 0,
      opened: (deliveryLogs as DeliveryLog[])?.filter((log: DeliveryLog) => log.status === 'opened').length || 0,
      pending: (deliveryLogs as DeliveryLog[])?.filter((log: DeliveryLog) => log.status === 'pending').length || 0,
    };

    return NextResponse.json({
      logs: deliveryLogs,
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in delivery status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}