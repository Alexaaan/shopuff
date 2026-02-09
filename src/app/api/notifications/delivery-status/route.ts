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
    nom: string;
    prenom: string;
  } | null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Test if table is accessible
    const { error: testError } = await supabase
      .from('notification_logs')
      .select('id')
      .limit(1);

    if (testError) {
      return NextResponse.json({
        error: 'Table notification_logs inaccessible',
        details: testError.message,
        logs: [],
        stats: { total: 0, sent: 0, failed: 0, opened: 0, pending: 0 },
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
      });
    }

    // Fetch delivery logs
    const { data: deliveryLogs, error, count } = await supabase
      .from('notification_logs')
      .select('id,notification_id,user_id,device_token,platform,status,error_message,sent_at,opened_at')
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({
        error: 'Erreur récupération logs livraison',
        details: error.message,
        logs: [],
        stats: { total: 0, sent: 0, failed: 0, opened: 0, pending: 0 },
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
      });
    }

    // Fetch user info separately
    const typedLogs = deliveryLogs as DeliveryLog[];
    if (typedLogs && typedLogs.length > 0) {
      const userIds = typedLogs.map(log => log.user_id).filter(id => id > 0);
      if (userIds.length > 0) {
        const { data: userData } = await supabase
          .from('users')
          .select('id,nom,prenom')
          .in('id', userIds);

        const userMap: Record<number, { nom: string; prenom: string }> = {};
        if (Array.isArray(userData)) {
          userData.forEach(user => {
            userMap[user.id] = { nom: user.nom, prenom: user.prenom };
          });
        }

        typedLogs.forEach(log => {
          if (log.user_id && userMap[log.user_id]) {
            log.users = userMap[log.user_id];
          }
        });
      }
    }

    // Calculate stats
    const stats = {
      total: count || 0,
      sent: typedLogs?.filter(log => log.status === 'sent').length || 0,
      failed: typedLogs?.filter(log => log.status === 'failed').length || 0,
      opened: typedLogs?.filter(log => log.status === 'opened').length || 0,
      pending: typedLogs?.filter(log => log.status === 'pending').length || 0,
    };

    return NextResponse.json({
      logs: typedLogs,
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
