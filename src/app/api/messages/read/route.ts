import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { order_id, user_id } = await request.json();

    if (!order_id || !user_id) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    // Update unread messages for this order where user is not the sender
    const { data: messagesToMark, error: fetchError } = await supabase
      .from('messages')
      .select('id')
      .eq('order_id', order_id)
      .neq('user_id', user_id)
      .is('read_at', null);

    if (fetchError) {
      console.error('Error fetching messages to mark as read:', fetchError);
      return NextResponse.json({ error: 'Erreur' }, { status: 500 });
    }

    if (messagesToMark && messagesToMark.length > 0) {
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('order_id', order_id)
        .neq('user_id', user_id)
        .is('read_at', null);

      if (updateError) {
        console.error('Error marking messages as read:', updateError);
      }
    }

    return NextResponse.json({ success: true, marked_count: messagesToMark?.length || 0 });
  } catch (error) {
    console.error('Error in mark as read:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
