import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabase();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const { is_active } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Récupérer l'ancien statut avant mise à jour
    const { data: oldUser, error: fetchError } = await supabase
      .from('users')
      .select('is_active')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching old user:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const wasInactive = !oldUser.is_active;
    const becomingActive = is_active;

    const { data, error } = await supabase
      .from('users')
      .update({ is_active: is_active })
      .eq('id', userId)
      .select('id, nom, prenom, telephone, role, is_active, created_at')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Note: Les notifications push sont envoyées lors de la première connexion
    // après approbation, pas lors de l'approbation elle-même
    // car les devices ne sont pas encore enregistrés lors de l'inscription

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

