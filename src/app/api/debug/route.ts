import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabase();

    // Check database tables
    const tables = [
      'user_devices',
      'notifications',
      'notification_targets',
      'notification_logs',
      'notification_presets',
      'chat_presence',
      'messages'
    ];

    const tableStatus: Record<string, any> = {};
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        tableStatus[table] = {
          exists: !error,
          count: count || 0,
          error: error?.message
        };
      } catch (err) {
        tableStatus[table] = {
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        };
      }
    }

    // Check environment variables
    const envStatus = {
      FCM_SERVER_KEY: !!process.env.FCM_SERVER_KEY,
      NEXT_PUBLIC_FCM_VAPID_KEY: !!process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL
    };

    return NextResponse.json({
      status: 'debug',
      timestamp: new Date().toISOString(),
      database: tableStatus,
      environment: envStatus,
      message: 'Debug information for notifications system'
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}