-- ===========================================
-- CORRECTION : Ajouter 'virement' aux méthodes de paiement autorisées
-- Exécuter dans Supabase SQL Editor
-- ===========================================

-- Vérifier la contrainte actuelle
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'orders'::regclass;

-- Supprimer l'ancienne contrainte
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Ajouter la nouvelle contrainte avec 'virement' inclus
ALTER TABLE orders
ADD CONSTRAINT orders_payment_method_check
CHECK (payment_method IN ('espece', 'carte_bleue', 'cheque', 'virement'));

-- Vérifier la nouvelle contrainte
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'orders'::regclass;
