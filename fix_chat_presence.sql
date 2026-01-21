-- Fix pour ajouter chat_presence si manquant

-- =====================
-- TABLE CHAT_PRESENCE
-- =====================
CREATE TABLE IF NOT EXISTS chat_presence (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_cp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cp_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_order UNIQUE (user_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_cp_user_order ON chat_presence(user_id, order_id);
CREATE INDEX IF NOT EXISTS idx_cp_active ON chat_presence(is_active);

-- RLS pour chat_presence
ALTER TABLE chat_presence ENABLE ROW LEVEL SECURITY;
-- Policy temporaire pour permettre les opérations (à ajuster selon auth)
CREATE POLICY "Allow all operations on presence" ON chat_presence FOR ALL USING (true);