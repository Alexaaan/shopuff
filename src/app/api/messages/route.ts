import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

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
    const { order_id, user_id, message } = await request.json();

    if (!order_id || !user_id || !message) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

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

    return NextResponse.json({ success: true, message: data });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}