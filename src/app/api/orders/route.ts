import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import admin from 'firebase-admin';

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

    // Envoyer une notification push à tous les admins
    try {
      // Récupérer les noms des produits pour la notification
      const productIds = order_products.map((op: any) => op.product_id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, nom')
        .in('id', productIds);

      if (productsError) {
        console.error('Error fetching product names:', productsError);
      }

      // Créer un mapping id -> nom
      const productNames: { [key: number]: string } = {};
      products?.forEach((product: any) => {
        productNames[product.id] = product.nom;
      });

      // Récupérer les devices de tous les admins
      const { data: adminDevices, error: devicesError } = await supabase
        .from('user_devices')
        .select('device_token, platform')
        .eq('is_active', true)
        .in('user_id',
          (await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .eq('is_active', true)
          ).data?.map((admin: any) => admin.id) || []
        );

      if (!devicesError && adminDevices && adminDevices.length > 0) {
        // Initialiser Firebase Admin si pas déjà fait
        if (!admin.apps.length) {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        }

        // Créer le message de notification
        const orderProducts = order_products.map((op: any) => {
          const productName = productNames[op.product_id] || 'produit';
          return `${op.quantite}x ${productName}`;
        }).join(', ');

        const message = {
          notification: {
            title: '🛒 Nouvelle commande !',
            body: `Commande #${order.id} - ${orderProducts}`,
          },
          data: {
            type: 'new_order',
            orderId: order.id.toString(),
            total: total.toString(),
          },
        };

        // Envoyer à tous les devices des admins
        const sendPromises = adminDevices.map((device: any) =>
          admin.messaging().send({
            ...message,
            token: device.device_token,
          }).catch((err: any) => {
            console.error('Error sending notification to admin device:', device.device_token, err);
          })
        );

        await Promise.all(sendPromises);
        console.log(`Order notification sent to ${adminDevices.length} admin device(s) for order ${order.id}`);
      }
    } catch (notificationError) {
      console.error('Error sending order notification to admins:', notificationError);
      // Ne pas échouer la commande pour autant
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