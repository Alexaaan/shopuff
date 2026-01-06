import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        utilisateur_id,
        vendeur_id,
        debut_commande,
        fin_commande,
        statut,
        payment_method,
        adresse_livraison,
        total,
        users!utilisateur_id (
          nom,
          prenom
        ),
        order_products (
          quantite,
          prix_unitaire,
          products (
            nom
          )
        )
      `)
      .order('debut_commande', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { id, statut } = await request.json();

    if (!id || !statut) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ statut })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data[0] });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}