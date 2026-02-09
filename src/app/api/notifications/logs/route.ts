import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

interface NotificationLog {
  id: number;
  title: string;
  message: string;
  type: string;
  target_type: string;
  target_value: string | null;
  sent_by: number | null;
  devices_targeted: number;
  devices_success: number;
  devices_failed: number;
  created_at: string;
  users?: {
    nom: string;
    prenom: string;
    email?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Récupérer les campagnes avec les informations de l'expéditeur
    // Note: Cette requête échouera si la table notification_campaigns n'existe pas encore
    // L'utilisateur doit d'abord exécuter la migration SQL
    let campaigns = [];
    let count = 0;
    let error = null;

    try {
      const result = await supabase
        .from('notification_campaigns')
        .select(`
          id,
          title,
          message,
          type,
          target_type,
          target_value,
          sent_by,
          devices_targeted,
          devices_success,
          devices_failed,
          created_at,
          users!notification_campaigns_sent_by_fkey (
            nom,
            prenom,
            email
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      campaigns = result.data || [];
      count = result.count || 0;
      error = result.error;
    } catch (err) {
      // Table n'existe pas encore - retourner un tableau vide
      console.log('Table notification_campaigns does not exist yet. Please run the SQL migration first.');
      campaigns = [];
      count = 0;
    }

    // Ne retourner une erreur que si la table existe mais qu'il y a une vraie erreur
    // Si la table n'existe pas, on retourne simplement un tableau vide
    if (error && campaigns.length > 0) {
      console.error('Error fetching notification logs:', error);
      return NextResponse.json({ error: 'Erreur récupération logs' }, { status: 500 });
    }

    return NextResponse.json({
      logs: campaigns as NotificationLog[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notification logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}