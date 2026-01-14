import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { utilisateur_id, statut, payment_method, adresse_livraison, total, order_products } = await request.json();

    if (!utilisateur_id || !order_products || order_products.length === 0) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        utilisateur_id,
        statut: statut || 'en_attente',
        payment_method: payment_method || 'sur_place',
        adresse_livraison: adresse_livraison || 'A récupérer sur place',
        total
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Erreur création commande' }, { status: 500 });
    }

    // Insert order products
    const orderProductsData = order_products.map((op: any) => ({
      order_id: order.id,
      product_id: op.product_id,
      quantite: op.quantite,
      prix_unitaire: op.prix_unitaire
    }));

    const { error: productsError } = await supabase
      .from('order_products')
      .insert(orderProductsData);

    if (productsError) {
      console.error('Error creating order products:', productsError);
      return NextResponse.json({ error: 'Erreur produits commande' }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
    const { id, statut, payment_method } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (statut) updates.statut = statut;
    if (payment_method !== undefined) updates.payment_method = payment_method;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
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