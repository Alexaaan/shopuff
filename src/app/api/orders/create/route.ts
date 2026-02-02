import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "shopu-d287a",
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

interface OrderData {
  client_type: 'existing' | 'new' | 'unique';
  existing_client_id?: number;
  new_client?: {
    nom: string;
    prenom: string;
    telephone: string;
  };
  unique_client?: {
    prenom: string;
  };
  items: {
    product_id: number;
    quantite: number;
    prix_unitaire: number;
  }[];
  payment_method: string;
  adresse_livraison?: string;
  notes?: string;
  total: number;
  debut_commande: string;
  statut: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const data: OrderData = await request.json();

    console.log('📦 Creating new order:', data);

    let clientId = data.existing_client_id;

    // Pour les commandes uniques, on utilise un client temporaire (pas de création)
    if (data.client_type === 'unique' && data.unique_client) {
      // Créer un client temporaire pour les commandes uniques
      const tempClientName = `Client-${data.unique_client.prenom}-${Date.now()}`;
      const { data: tempClient, error: tempError } = await supabase
        .from('users')
        .insert({
          nom: tempClientName,
          prenom: data.unique_client.prenom,
          telephone: `TEMP${Date.now()}`,
          secret_code: 'temp123',
          role: 'user',
          is_active: false // Client temporaire, pas actif
        })
        .select()
        .single();

      if (tempError) {
        console.error('❌ Error creating temp client:', tempError);
        return NextResponse.json({ error: 'Erreur création client temporaire' }, { status: 500 });
      }

      clientId = tempClient.id;
      console.log('✅ Temp client created for unique order:', clientId);
    }

    // Créer un nouveau client si nécessaire
    if (data.client_type === 'new' && data.new_client) {
      console.log('👤 Creating new client...');

      // Générer un numéro de téléphone temporaire si non fourni
      let telephone = data.new_client.telephone;
      if (!telephone) {
        // Générer un numéro temporaire basé sur timestamp
        telephone = `TEMP${Date.now().toString().slice(-6)}`;
      }

      const { data: newClient, error: clientError } = await supabase
        .from('users')
        .insert({
          nom: data.new_client.nom,
          prenom: data.new_client.prenom,
          telephone: telephone,
          secret_code: 'client123', // Code par défaut pour les clients créés depuis admin
          role: 'user', // Utiliser 'user' au lieu de 'client'
          is_active: true
        })
        .select()
        .single();

      if (clientError) {
        console.error('❌ Error creating client:', clientError);
        return NextResponse.json({ error: 'Erreur création client' }, { status: 500 });
      }

      clientId = newClient.id;
      console.log('✅ New client created with ID:', clientId);
    }

    if (!clientId) {
      return NextResponse.json({ error: 'Client non spécifié' }, { status: 400 });
    }

    // Créer la commande
    console.log('🛒 Creating order...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        utilisateur_id: clientId,
        vendeur_id: null, // Commande admin
        debut_commande: data.debut_commande,
        statut: data.statut,
        payment_method: data.payment_method,
        adresse_livraison: data.adresse_livraison,
        total: data.total,
        notes: data.notes
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error creating order:', orderError);
      return NextResponse.json({ error: 'Erreur création commande' }, { status: 500 });
    }

    console.log('✅ Order created with ID:', order.id);

    // Ajouter les produits à la commande et mettre à jour les stocks
    console.log('📦 Adding products to order...');
    for (const item of data.items) {
      // Vérifier le stock disponible
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();

      if (productError || !product) {
        console.error('❌ Product not found:', item.product_id);
        continue;
      }

      if (product.stock < item.quantite) {
        console.error(`❌ Insufficient stock for product ${item.product_id}: ${product.stock} available, ${item.quantite} requested`);
        return NextResponse.json({
          error: `Stock insuffisant pour le produit ${item.product_id}`
        }, { status: 400 });
      }

      // Ajouter le produit à la commande
      const { error: itemError } = await supabase
        .from('order_products')
        .insert({
          order_id: order.id,
          product_id: item.product_id,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire
        });

      if (itemError) {
        console.error('❌ Error adding product to order:', itemError);
        continue;
      }

      // Mettre à jour le stock
      const { error: stockError } = await supabase
        .from('products')
        .update({
          stock: product.stock - item.quantite
        })
        .eq('id', item.product_id);

      if (stockError) {
        console.error('❌ Error updating stock:', stockError);
      } else {
        console.log(`✅ Stock updated for product ${item.product_id}: -${item.quantite}`);
      }
    }

    // Créer une entrée dans les logs
    await supabase
      .from('logs')
      .insert({
        admin_id: 1, // Admin par défaut
        action: 'Création de commande',
        cible_type: 'order',
        cible_id: order.id,
        details: `Commande créée pour ${data.client_type === 'new' ? 'nouveau client' : 'client existant'} - Total: ${data.total}€`
      });

    console.log('🎉 Order created successfully!');

    // Send notification to all admins
    await sendOrderNotificationToAdmins(supabase, order, data.items);

    return NextResponse.json({
      success: true,
      order: order,
      message: 'Commande créée avec succès'
    });

  } catch (error) {
    console.error('❌ Error in order creation:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// Helper function to send order notifications to admins
async function sendOrderNotificationToAdmins(supabase: any, order: any, items: any[]) {
  try {
    // Récupérer les noms des produits pour la notification
    const productIds = items.map((op: any) => op.product_id);
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

    if (devicesError || !adminDevices || adminDevices.length === 0) {
      console.log('No admin devices found for notifications');
      return;
    }

    // Créer le message de notification
    const orderProducts = items.map((op: any) => {
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
        total: order.total.toString(),
      },
      webpush: {
        notification: {
          title: '🛒 Nouvelle commande !',
          body: `Commande #${order.id} - ${orderProducts}`,
          icon: '/logo.png',
          badge: '/logo.png',
          data: {
            order_id: order.id.toString(),
            type: 'new_order',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://shopuff.vercel.app'}/admin/dashboard/orders?orderId=${order.id}`
          },
          actions: [
            { action: 'open', title: 'Voir commande' }
          ]
        },
        fcmOptions: {
          link: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://shopuff.vercel.app'}/admin/dashboard/orders?orderId=${order.id}`
        }
      }
    };

    // Envoyer à tous les devices des admins
    for (const device of adminDevices) {
      try {
        await admin.messaging().send({
          ...message,
          token: device.device_token,
        });
        console.log(`✅ Notification sent to admin device for order ${order.id}`);
      } catch (err: any) {
        console.error('❌ Error sending notification to admin device:', err.message);
      }
    }
  } catch (notificationError) {
    console.error('❌ Error sending order notification to admins:', notificationError);
  }
}