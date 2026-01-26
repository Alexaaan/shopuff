async function showTables() {
  try {
    console.log('🔍 Récupération de la liste des tables...\n');

    const response = await fetch('http://localhost:3000/api/debug/tables');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log(`📋 TABLES TROUVÉES (${data.count} tables) :\n`);

    data.tables.forEach((table, index) => {
      console.log(`${index + 1}. 📊 ${table.name} (${table.type})`);

      if (table.columns && table.columns.length > 0) {
        console.log('   Colonnes:');
        table.columns.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultValue = col.column_default ? ` DEFAULT ${col.column_default}` : '';
          console.log(`     - ${col.column_name}: ${col.data_type} ${nullable}${defaultValue}`);
        });
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Assurez-vous que le serveur Next.js est démarré avec: npm run dev');
  }
}

showTables();