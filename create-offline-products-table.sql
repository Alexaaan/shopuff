-- Créer la table offline_products si elle n'existe pas
CREATE TABLE IF NOT EXISTS offline_products (
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

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_offline_products_status ON offline_products(status);
CREATE INDEX IF NOT EXISTS idx_offline_products_created_by ON offline_products(created_by);

-- Insérer un utilisateur admin si aucun n'existe
INSERT INTO users (nom, prenom, telephone, secret_code, role)
VALUES ('Admin', 'System', '0000000000', 'admin123', 'admin')
ON CONFLICT (telephone) DO NOTHING;

-- Vérifier que l'utilisateur admin existe
SELECT id, nom, prenom, role FROM users WHERE role = 'admin';