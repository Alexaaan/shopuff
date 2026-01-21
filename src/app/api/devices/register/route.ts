import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { user_id, device_token, platform } = await request.json();

    if (!user_id || !device_token || !platform) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    // Upsert device
    const { error } = await supabase
      .from('user_devices')
      .upsert({
        user_id,
        device_token,
        platform,
        is_active: true,
        last_used_at: new Date().toISOString()
      }, { onConflict: 'device_token' });

    if (error) {
      console.error('Error registering device:', error);
      return NextResponse.json({ error: 'Erreur enregistrement device' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error registering device:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}