import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { user_id, device_token, platform } = await request.json();

    console.log('[DEBUG] Registering device for user:', user_id);
    console.log('[DEBUG] Token length:', device_token?.length);
    console.log('[DEBUG] Platform:', platform);

    if (!user_id || !device_token || !platform) {
      console.error('[DEBUG] Invalid data:', { user_id, device_token_length: device_token?.length, platform });
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
      console.error('[DEBUG] Database error:', error);
      return NextResponse.json({ error: 'Erreur enregistrement device' }, { status: 500 });
    }

    console.log('[DEBUG] Device registered successfully for user:', user_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DEBUG] Server error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}