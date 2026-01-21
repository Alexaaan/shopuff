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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabase();
    const resolvedParams = await params;
    const productId = resolvedParams.id;

    const { data: ratings, error } = await supabase
      .from('product_ratings')
      .select(`
        id,
        rating,
        comment,
        created_at,
        users (
          nom,
          prenom
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ratings:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json(ratings || []);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await getSupabase();
    const resolvedParams = await params;
    const productId = resolvedParams.id;
    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    // Insert or update rating
    const { data: existingRating } = await supabase
      .from('product_ratings')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single();

    if (existingRating) {
      // Update existing rating
      const { error: updateError } = await supabase
        .from('product_ratings')
        .update({ rating, comment })
        .eq('id', existingRating.id);

      if (updateError) {
        console.error('Error updating rating:', updateError);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    } else {
      // Insert new rating
      const { error: insertError } = await supabase
        .from('product_ratings')
        .insert({
          product_id: productId,
          user_id: userId,
          rating,
          comment
        });

      if (insertError) {
        console.error('Error inserting rating:', insertError);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    }

    // Update product average rating
    await updateProductRating(productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateProductRating(productId: string) {
  const supabase = await getSupabase();

  // Get all ratings for this product
  const { data: ratings } = await supabase
    .from('product_ratings')
    .select('rating')
    .eq('product_id', productId);

  if (ratings && ratings.length > 0) {
    const averageRating = ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratings.length;
    const ratingCount = ratings.length;

    await supabase
      .from('products')
      .update({
        average_rating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
        rating_count: ratingCount
      })
      .eq('id', productId);
  }
}