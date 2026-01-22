const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertOfflineProducts() {
  try {
    const productsPath = path.join(__dirname, 'public', 'products.json');
    const productsData = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(productsData);

    const productsToInsert = products.map(product => ({
      nom: product.nom,
      prix: product.prix,
      image: product.image,
      stock: 100, // Default stock
      is_active: true,
      description: '', // Empty description
      status: 'pending',
      created_by: null // No creator for imported products
    }));

    const { data, error } = await supabase
      .from('offline_products')
      .insert(productsToInsert);

    if (error) {
      console.error('Error inserting offline products:', error);
    } else {
      console.log('Offline products inserted successfully:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

insertOfflineProducts();