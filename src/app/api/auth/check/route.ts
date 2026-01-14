import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getSupabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };

    const supabase = await getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, nom, prenom, role')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}