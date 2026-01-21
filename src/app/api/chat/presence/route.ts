import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { user_id, order_id, is_active } = await request.json();

    if (!user_id || !order_id) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    const { error } = await supabase
      .from('chat_presence')
      .upsert({
        user_id,
        order_id,
        last_seen_at: new Date().toISOString(),
        is_active: is_active !== false // default true
      }, { onConflict: 'user_id,order_id' });

    if (error) {
      console.error('Error updating presence:', error);
      return NextResponse.json({ error: 'Erreur mise à jour présence' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating presence:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}