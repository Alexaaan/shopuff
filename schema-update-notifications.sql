-- ===========================================
-- MISE À JOUR SCHEMA : TABLES NOTIFICATIONS
-- ===========================================

-- Créer la table notification_logs
CREATE TABLE IF NOT EXISTS notification_logs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('info', 'warning', 'promo', 'system', 'order', 'message')) DEFAULT 'info',
    target_type VARCHAR(20) CHECK (target_type IN ('all', 'role', 'user')) DEFAULT 'all',
    target_value VARCHAR(100),
    sent_by INT REFERENCES users(id),
    devices_targeted INT DEFAULT 0,
    devices_success INT DEFAULT 0,
    devices_failed INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_logs_sender FOREIGN KEY (sent_by) REFERENCES users(id)
);

-- Créer la table notification_settings
CREATE TABLE IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer les paramètres par défaut
INSERT INTO notification_settings (setting_key, setting_value, description) VALUES
('sound_enabled', 'true', 'Activer les sons de notification'),
('vibration_enabled', 'true', 'Activer les vibrations sur mobile'),
('auto_order_notifications', 'true', 'Notifications automatiques pour nouvelles commandes'),
('auto_message_notifications', 'true', 'Notifications automatiques pour messages de commande')
ON CONFLICT (setting_key) DO NOTHING;

-- Mettre à jour la table logs pour inclure les notifications
ALTER TABLE logs ADD CONSTRAINT IF NOT EXISTS check_logs_cible_type
CHECK (cible_type IN ('user', 'order', 'product', 'pack', 'promotion', 'notification'));

-- Créer un index pour améliorer les performances des logs
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_target_type ON notification_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_notification_settings_key ON notification_settings(setting_key);

-- Commentaires sur les tables
COMMENT ON TABLE notification_logs IS 'Historique des notifications envoyées avec statistiques de succès';
COMMENT ON TABLE notification_settings IS 'Paramètres de configuration des notifications';
COMMENT ON COLUMN notification_logs.devices_targeted IS 'Nombre total de devices ciblés';
COMMENT ON COLUMN notification_logs.devices_success IS 'Nombre de devices où la notification a été reçue avec succès';
COMMENT ON COLUMN notification_logs.devices_failed IS 'Nombre de devices où l''envoi a échoué';