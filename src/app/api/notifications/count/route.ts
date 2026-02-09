import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// GET /api/notifications/count - Get unread notification count
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { count, error } = await supabase
      .from('user_notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', parseInt(userId))
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching notification count:', error);
      return NextResponse.json({ error: 'Erreur comptage notifications' }, { status: 500 });
    }

    return NextResponse.json({ 
      unreadCount: count || 0 
    });
  } catch (error) {
    console.error('Error in notification count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
