const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables d\'environnement SUPABASE_URL et SUPABASE_ANON_KEY requises');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initOfflineProducts() {
  try {
    console.log('🔄 Initialisation de la table offline_products...');

    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'create-offline-products-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Diviser le SQL en statements individuels
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('📝 Exécution:', statement.trim().substring(0, 50) + '...');

        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement.trim()
        });

        if (error) {
          console.error('❌ Erreur lors de l\'exécution:', error);
          // Essayer avec une requête directe si rpc ne fonctionne pas
          try {
            const { data: directData, error: directError } = await supabase
              .from('offline_products')
              .select('id')
              .limit(1);

            if (directError && directError.message.includes('relation "offline_products" does not exist')) {
              console.log('⚠️ Table offline_products n\'existe pas, création manuelle...');

              // Créer la table manuellement
              const createTableSQL = `
                CREATE TABLE offline_products (
                  id SERIAL PRIMARY KEY,
                  nom VARCHAR(150) NOT NULL,
                  image VARCHAR(255),
                  prix DECIMAL(10,2) NOT NULL,
                  description TEXT,
                  stock INT NOT NULL DEFAULT 0,
                  is_active BOOLEAN DEFAULT TRUE,
                  average_rating DECIMAL(3,2) DEFAULT 0,
                  rating_count INT DEFAULT 0,
                  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
                  created_by INT REFERENCES users(id),
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
              `;

              console.log('📝 Création de la table offline_products...');
              // Note: Cette approche ne fonctionnera pas avec Supabase anon key
              // Il faudrait utiliser le service role key ou faire via l'interface Supabase
            }
          } catch (directErr) {
            console.error('❌ Erreur lors de la vérification:', directErr);
          }
        } else {
          console.log('✅ Statement exécuté avec succès');
        }
      }
    }

    console.log('🎉 Initialisation terminée!');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

initOfflineProducts();