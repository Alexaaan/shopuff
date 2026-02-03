import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, order_id, is_active } = body;

    console.log('[Presence] Received request:', { user_id, order_id, is_active });

    if (!user_id || !order_id) {
      console.error('[Presence] Missing required fields:', { user_id, order_id });
      return NextResponse.json({ error: 'Données invalides', received: { user_id, order_id } }, { status: 400 });
    }

    const supabase = await getSupabase();
    const { error } = await supabase
      .from('chat_presence')
      .upsert({
        user_id,
        order_id,
        last_seen_at: new Date().toISOString(),
        is_active: is_active !== false // default true
      }, { onConflict: 'user_id,order_id' });

    if (error) {
      console.error('[Presence] Supabase error:', error);
      return NextResponse.json({ error: 'Erreur mise à jour présence', details: error.message }, { status: 500 });
    }

    console.log('[Presence] Updated successfully for user:', user_id, 'order:', order_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Presence] Server error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
