import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabase();
    const resolvedParams = await params;
    const productId = resolvedParams.id;

    const { data: product, error } = await supabase
      .from('products')
      .select('id, nom, prix, image, description, stock, average_rating, rating_count')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}