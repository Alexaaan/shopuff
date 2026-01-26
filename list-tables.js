const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  try {
    console.log('🔍 Récupération de la liste des tables...\n');

    // Récupérer les tables via information_schema
    const { data: tables, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          schemaname,
          tablename,
          tableowner
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `
    });

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    console.log('📋 TABLES TROUVÉES :\n');

    if (tables && tables.length > 0) {
      tables.forEach((table, index) => {
        console.log(`${index + 1}. ${table.tablename}`);
        console.log(`   Schéma: ${table.schemaname}`);
        console.log(`   Propriétaire: ${table.tableowner}\n`);
      });
    } else {
      console.log('Aucune table trouvée dans le schéma public');
    }

    console.log('\n💡 Pour voir la structure détaillée d\'une table, utilisez :');
    console.log('   SELECT * FROM information_schema.columns WHERE table_name = \'nom_de_la_table\';');

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des tables:', error);
  }
}

listTables();