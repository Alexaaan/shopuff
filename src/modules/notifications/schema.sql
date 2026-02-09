-- =====================================================
-- NOTIFICATION SYSTEM SCHEMA
-- Ajout à la base de données existante
-- =====================================================

-- =====================
-- TABLE USER_NOTIFICATIONS
-- Notifications individuelles avec statut lu/non-lu
-- =====================
CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('message', 'order', 'system', 'promo', 'admin')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_un_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour performance
CREATE INDEX idx_un_user ON user_notifications(user_id);
CREATE INDEX idx_un_user_unread ON user_notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_un_created ON user_notifications(created_at DESC);

-- =====================
-- TABLE NOTIFICATION_PREFERENCES
-- Préférences de notification par utilisateur
-- =====================
CREATE TABLE IF NOT EXISTS notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    message_notifications BOOLEAN DEFAULT TRUE,
    order_notifications BOOLEAN DEFAULT TRUE,
    promo_notifications BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_np_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================
-- TABLE NOTIFICATION_CHANNELS
-- Canaux de notification (FCM, WebSocket, Email)
-- =====================
CREATE TABLE IF NOT EXISTS notification_channels (
    id SERIAL PRIMARY KEY,
    notification_id INT NOT NULL,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('fcm', 'websocket', 'email')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_nc_notification FOREIGN KEY (notification_id) REFERENCES user_notifications(id) ON DELETE CASCADE
);

-- Index pour tracking des canaux
CREATE INDEX idx_nc_notification ON notification_channels(notification_id);
CREATE INDEX idx_nc_status ON notification_channels(status);
