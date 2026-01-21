-- =====================================================
-- SCHEMA COMPLET BASE DE DONNEES
-- Projet : Site produits / commandes / packs / promotions
-- Compatible PostgreSQL / MySQL (adapter ENUM si besoin)
-- =====================================================

-- =====================
-- TABLE USERS
-- =====================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) UNIQUE NOT NULL,
    secret_code VARCHAR(100) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- TABLE PRODUCTS
-- =====================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    image VARCHAR(255),
    prix DECIMAL(10,2) NOT NULL,
    description TEXT,
    stock INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    average_rating DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_ratings (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, user_id)
);

-- =====================
-- TABLE PACKS
-- =====================
CREATE TABLE packs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    description TEXT,
    prix DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    date_debut TIMESTAMP,
    date_fin TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- TABLE PROMOTIONS
-- =====================
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    description TEXT,
    pourcentage INT CHECK (pourcentage BETWEEN 0 AND 100),
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================
-- TABLE ORDERS
-- =====================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    vendeur_id INT,
    debut_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fin_commande TIMESTAMP,
    statut VARCHAR(20) CHECK (statut IN ('en_attente', 'confirmee', 'annulee', 'livree')) DEFAULT 'en_attente',
    payment_method VARCHAR(20) CHECK (payment_method IN ('espece', 'carte_bleue')) NOT NULL,
    adresse_livraison TEXT,
    total DECIMAL(10,2) DEFAULT 0,

    CONSTRAINT fk_orders_user FOREIGN KEY (utilisateur_id) REFERENCES users(id),
    CONSTRAINT fk_orders_admin FOREIGN KEY (vendeur_id) REFERENCES users(id)
);

-- =====================
-- TABLE ORDER_PRODUCTS
-- =====================
CREATE TABLE order_products (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_op_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_op_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =====================
-- TABLE ORDER_PACKS
-- =====================
CREATE TABLE order_packs (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    pack_id INT NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_opk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_opk_pack FOREIGN KEY (pack_id) REFERENCES packs(id)
);

-- =====================
-- TABLE PACK_PRODUCTS
-- =====================
CREATE TABLE pack_products (
    id SERIAL PRIMARY KEY,
    pack_id INT NOT NULL,
    product_id INT NOT NULL,
    quantite INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_pp_pack FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE,
    CONSTRAINT fk_pp_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =====================
-- TABLE PROMOTION_PRODUCTS
-- =====================
CREATE TABLE promotion_products (
    id SERIAL PRIMARY KEY,
    promotion_id INT NOT NULL,
    product_id INT NOT NULL,

    CONSTRAINT fk_prp_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    CONSTRAINT fk_prp_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =====================
-- TABLE MESSAGES
-- =====================
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_messages_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================
-- TABLE LOGS (actions admin)
-- =====================
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    cible_type VARCHAR(20) CHECK (cible_type IN ('user', 'order', 'product', 'pack', 'promotion')),
    cible_id INT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- =====================
-- INDEXES (performance)
-- =====================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_orders_statut ON orders(statut);
CREATE INDEX idx_orders_user ON orders(utilisateur_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_packs_active ON packs(is_active);



-- =====================
-- FIN DU SCHEMA
-- =====================