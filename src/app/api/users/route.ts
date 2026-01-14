import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { nom, prenom, telephone, secret_code, role } = await request.json();

    if (!nom || !prenom || !telephone || !secret_code) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        nom,
        prenom,
        telephone,
        secret_code,
        role: role || 'user',
        is_active: true
      })
      .select();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: 'Erreur création utilisateur' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data[0] });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}