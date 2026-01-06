import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // For simplicity, assume a hardcoded admin or check from supabase
    // In real app, check user credentials
    if (email === 'admin@example.com' && password === 'password') {
      const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
      const response = NextResponse.json({ success: true });
      response.cookies.set('token', token, { httpOnly: true, path: '/' });
      return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}