import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

interface TableInfo {
  table_name: string;
  table_type: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

export async function GET() {
  try {
    const supabase = await getSupabase();

    // Liste des tables connues du projet (basé sur les fichiers SQL existants)
    const knownTables = [
      'users',
      'user_devices',
      'products',
      'orders',
      'order_items',
      'logs',
      'notification_logs',
      'notification_settings',
      'chats',
      'messages',
      'product_ratings',
      'cart_items',
      'packs',
      'promotions'
    ];

    // Tester chaque table pour voir si elle existe
    const existingTables = [];

    for (const tableName of knownTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          // La table existe, récupérer sa structure
          const { data: columns } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default')
            .eq('table_name', tableName)
            .eq('table_schema', 'public')
            .order('ordinal_position');

          existingTables.push({
            name: tableName,
            type: 'BASE TABLE',
            columns: columns || []
          });
        }
      } catch (err) {
        // Table n'existe pas, ignorer
        continue;
      }
    }

    return NextResponse.json({
      tables: existingTables,
      count: existingTables.length,
      note: 'Liste basée sur les tables connues du projet'
    });
  } catch (error) {
    console.error('Error in tables API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}