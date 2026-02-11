import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { product_id } = await request.json();

    const supabase = await getSupabase();

    // Check if already favorite
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', product_id);

      if (error) throw error;
      return NextResponse.json({ isFavorite: false });
    }

    // Add to favorites
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, product_id });

    if (error) throw error;
    return NextResponse.json({ isFavorite: true });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
