import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, nom, prix, image, stock')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, prix, stock } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (prix !== undefined) updates.prix = prix;
    if (stock !== undefined) updates.stock = stock;

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data[0] });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}