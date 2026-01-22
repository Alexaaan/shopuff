import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabase();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabase();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    console.log('DELETE request for product ID:', id);

    if (!id) {
      console.log('No ID provided');
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const productId = parseInt(id);
    if (isNaN(productId)) {
      console.log('Invalid ID format:', id);
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    console.log('Deleting product with ID:', productId);

    const { error, data } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .select();

    console.log('Delete result:', { data, error });

    if (error) {
      console.error('Supabase error deleting product:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 });
    }

    console.log('Product deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}