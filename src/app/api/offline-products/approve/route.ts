import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Offline product ID is required' }, { status: 400 });
    }

    // Get the offline product
    const { data: offlineProduct, error: fetchError } = await supabase
      .from('offline_products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !offlineProduct) {
      console.error('Error fetching offline product:', fetchError);
      return NextResponse.json({ error: 'Offline product not found' }, { status: 404 });
    }

    // Insert into products
    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert({
        nom: offlineProduct.nom,
        prix: offlineProduct.prix,
        image: offlineProduct.image,
        description: offlineProduct.description,
        stock: offlineProduct.stock,
        is_active: offlineProduct.is_active,
        average_rating: offlineProduct.average_rating,
        rating_count: offlineProduct.rating_count
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting product:', insertError);
      return NextResponse.json({ error: 'Failed to approve product' }, { status: 500 });
    }

    // Update offline product status to approved
    const { error: updateError } = await supabase
      .from('offline_products')
      .update({ status: 'approved' })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating offline product status:', updateError);
      // Don't fail the whole operation, but log it
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error approving offline product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}