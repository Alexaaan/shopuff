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
        opened_at,
        users!notification_logs_user_id_fkey (
          name,
          email
        )
      `, { count: 'exact' })
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching delivery logs:', error);
      return NextResponse.json({ error: 'Erreur récupération logs livraison' }, { status: 500 });
    }

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