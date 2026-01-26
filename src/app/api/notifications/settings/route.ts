import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

interface NotificationSetting {
  setting_key: string;
  setting_value: string;
  description: string;
  updated_at: string;
}

export async function GET() {
  try {
    const supabase = await getSupabase();

    let settings = [];
    try {
      const result = await supabase
        .from('notification_settings')
        .select('setting_key, setting_value, description, updated_at')
        .order('setting_key');

      settings = result.data || [];
      if (result.error) {
        console.log('Table notification_settings does not exist yet. Returning empty settings.');
        settings = [];
      }
    } catch (err) {
      console.log('Table notification_settings does not exist yet. Returning empty settings.');
      settings = [];
    }

    // Convertir en objet clé-valeur pour faciliter l'utilisation côté client
    const settingsObj: Record<string, any> = {};
    (settings as NotificationSetting[])?.forEach((setting: NotificationSetting) => {
      settingsObj[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description,
        updatedAt: setting.updated_at
      };
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const updates = await request.json();

    // Mettre à jour chaque setting (seulement si la table existe)
    try {
      const updatePromises = Object.entries(updates).map(async ([key, value]) => {
        const { error } = await supabase
          .from('notification_settings')
          .update({
            setting_value: value,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', key);

        if (error) {
          console.error(`Error updating setting ${key}:`, error);
          throw error;
        }
      });

      await Promise.all(updatePromises);
    } catch (err) {
      console.log('Table notification_settings does not exist yet. Settings not saved.');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ error: 'Erreur mise à jour paramètres' }, { status: 500 });
  }
}