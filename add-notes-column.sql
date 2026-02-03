-- ===========================================
-- CORRECTION : Ajouter les colonnes manquantes à la table 'orders'
-- Exécuter dans Supabase SQL Editor
-- ===========================================

-- Ajouter la colonne 'notes' (manquante dans le schéma)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Vérifier la structure de la table après modification
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Si la colonne existe déjà, ce message s'affichera
-- L'erreur "Could not find the 'notes' column" sera résolue après exécution

-- Redémarrer le projet Vercel après exécution
-- https://vercel.com/dashboard → Deployments → Redeploy
