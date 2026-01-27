import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data: offlineProducts, error } = await supabase
      .from('offline_products')
      .select('id, nom, prix, image, description, stock, average_rating, rating_count, status, created_by, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offline products:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json(offlineProducts);
  } catch (error) {
    console.error('Error fetching offline products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const body = await request.json();
    const { nom, prix, image, description, stock, created_by } = body;

    // Parse and validate inputs
    const parsedPrix = typeof prix === 'string' ? parseFloat(prix) : prix;
    const parsedStock = typeof stock === 'string' ? parseInt(stock) : stock;

    console.log('Creating offline product with data:', { nom, prix, image, description, stock, created_by });
    console.log('Parsed data:', { nom, parsedPrix, parsedStock, created_by });

    if (!nom || parsedPrix === undefined || isNaN(parsedPrix) || parsedPrix <= 0) {
      console.log('Validation failed:', { nom: !!nom, parsedPrix, isNaN: isNaN(parsedPrix), prixCheck: parsedPrix <= 0 });
      return NextResponse.json({ error: 'Name and valid positive price are required' }, { status: 400 });
    }

    // Vérifier si la table offline_products existe
    try {
      const { data: testData, error: testError } = await supabase
        .from('offline_products')
        .select('id')
        .limit(1);

      if (testError && testError.message.includes('relation "offline_products" does not exist')) {
        console.error('Table offline_products does not exist');
        return NextResponse.json({
          error: 'Database table not found',
          details: 'The offline_products table does not exist. Please run the database migration.',
          suggestion: 'Execute the SQL script: create-offline-products-table.sql'
        }, { status: 500 });
      }
    } catch (tableCheckError) {
      console.error('Error checking table existence:', tableCheckError);
    }

    // Vérifier si l'utilisateur existe (optionnel pour les produits offline)
    let validCreatedBy = null;
    if (created_by && typeof created_by === 'number') {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', created_by)
        .single();

      if (userError || !userData) {
        console.error('User does not exist:', created_by, '- setting created_by to null');
        validCreatedBy = null;
      } else {
        validCreatedBy = created_by;
      }
    }

    const { data, error } = await supabase
      .from('offline_products')
      .insert({
        nom,
        prix: parsedPrix,
        image,
        description,
        stock: parsedStock || 0,
        created_by: validCreatedBy
      })
      .select()
      .single();

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Error creating offline product:', error);
      console.error('Error details:', error.message, error.details, error.hint);

      // Gérer les erreurs de contrainte spécifiques
      if (error.message.includes('violates foreign key constraint')) {
        return NextResponse.json({
          error: 'Invalid reference',
          details: 'The created_by user does not exist'
        }, { status: 400 });
      }

      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error) {
    console.error('Error creating offline product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { id, nom, prix, image, description, stock, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (nom !== undefined) updates.nom = nom;
    if (prix !== undefined) updates.prix = prix;
    if (image !== undefined) updates.image = image;
    if (description !== undefined) updates.description = description;
    if (stock !== undefined) updates.stock = stock;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabase
      .from('offline_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating offline product:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error) {
    console.error('Error updating offline product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('offline_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting offline product:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting offline product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}