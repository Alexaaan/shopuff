import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getSupabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function POST(request: Request) {
  try {
    const { secret_code } = await request.json();

    if (!secret_code) {
      return NextResponse.json({ error: 'Code secret requis' }, { status: 400 });
    }

    const supabase = await getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('secret_code', secret_code)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Code secret invalide' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    const response = NextResponse.json({ success: true, user: { id: user.id, nom: user.nom, prenom: user.prenom, role: user.role } });
    response.cookies.set('token', token, { httpOnly: true, path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}