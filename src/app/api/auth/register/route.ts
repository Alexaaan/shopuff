import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { nom, prenom, telephone, secretCode } = await request.json();

    // Validation
    if (!nom || !prenom || !telephone || !secretCode) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('telephone', telephone)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec ce numéro de téléphone' },
        { status: 400 }
      );
    }

    // Créer l'utilisateur
    const hashedSecretCode = await bcrypt.hash(secretCode, 10);

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        nom,
        prenom,
        telephone,
        secret_code: hashedSecretCode,
        role: 'user'
      })
      .select('id, nom, prenom, role')
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      );
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      user: newUser,
      message: 'Compte créé avec succès'
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 jours
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}