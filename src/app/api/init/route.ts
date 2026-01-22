import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = await getSupabase();

    console.log('🔄 Initialisation de la base de données...');

    // 1. Créer un utilisateur admin si aucun n'existe
    console.log('👤 Vérification de l\'utilisateur admin...');
    const { data: existingAdmin, error: adminCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    let adminId = existingAdmin?.id;

    if (!existingAdmin) {
      console.log('👤 Création de l\'utilisateur admin...');
      const { data: newAdmin, error: createAdminError } = await supabase
        .from('users')
        .insert({
          nom: 'Admin',
          prenom: 'System',
          telephone: '0000000000',
          secret_code: 'admin123',
          role: 'admin'
        })
        .select('id')
        .single();

      if (createAdminError) {
        console.error('Erreur création admin:', createAdminError);
        return NextResponse.json({
          error: 'Failed to create admin user',
          details: createAdminError.message
        }, { status: 500 });
      }

      adminId = newAdmin.id;
      console.log('✅ Admin créé avec ID:', adminId);
    } else {
      console.log('✅ Admin existe déjà avec ID:', adminId);
    }

    // 2. Vérifier si la table offline_products existe
    console.log('📋 Vérification de la table offline_products...');
    try {
      const { error: tableCheckError } = await supabase
        .from('offline_products')
        .select('id')
        .limit(1);

      if (tableCheckError && tableCheckError.message.includes('relation "offline_products" does not exist')) {
        console.log('📋 Table offline_products n\'existe pas, création...');

        // Note: Avec Supabase, on ne peut pas créer de tables via l'API REST
        // Il faut le faire via l'interface SQL ou le CLI
        return NextResponse.json({
          error: 'Table creation required',
          details: 'The offline_products table needs to be created manually',
          solution: 'Please execute the SQL script create-offline-products-table.sql in your Supabase SQL editor',
          adminId: adminId
        }, { status: 500 });
      }

      console.log('✅ Table offline_products existe');

    } catch (tableError) {
      console.error('Erreur vérification table:', tableError);
      return NextResponse.json({
        error: 'Table check failed',
        details: tableError instanceof Error ? tableError.message : 'Unknown error'
      }, { status: 500 });
    }

    console.log('🎉 Initialisation terminée avec succès!');
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      adminId: adminId
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    return NextResponse.json({
      error: 'Initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}