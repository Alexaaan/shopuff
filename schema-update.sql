-- =====================
-- TABLE USER_DEVICES
-- =====================
CREATE TABLE user_devices (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    device_token VARCHAR(255) UNIQUE NOT NULL,
    platform VARCHAR(10) CHECK (platform IN ('ios', 'android', 'web')) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,

    CONSTRAINT fk_devices_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_devices_user ON user_devices(user_id);
CREATE INDEX idx_devices_active ON user_devices(is_active);
-- =====================
-- TABLE NOTIFICATIONS
-- =====================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('info', 'warning', 'promo', 'system')) DEFAULT 'info',
    image_url VARCHAR(255),
    action_url VARCHAR(255),
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')) DEFAULT 'draft',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_admin FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_schedule ON notifications(scheduled_at);
-- =====================
-- TABLE NOTIFICATION_TARGETS
-- =====================
CREATE TABLE notification_targets (
    id SERIAL PRIMARY KEY,
    notification_id INT NOT NULL,
    target_type VARCHAR(10) CHECK (target_type IN ('user', 'role', 'all')) NOT NULL,
    target_value VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_nt_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
);

CREATE INDEX idx_nt_notification ON notification_targets(notification_id);
-- =====================
-- TABLE NOTIFICATION_LOGS
-- =====================
CREATE TABLE notification_logs (
    id SERIAL PRIMARY KEY,
    notification_id INT NOT NULL,
    user_id INT NOT NULL,
    device_token VARCHAR(255),
    platform VARCHAR(10),
    status VARCHAR(10) CHECK (status IN ('sent', 'failed', 'opened')) NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    opened_at TIMESTAMP,

    CONSTRAINT fk_nl_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    CONSTRAINT fk_nl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_nl_notification ON notification_logs(notification_id);
CREATE INDEX idx_nl_user ON notification_logs(user_id);
-- =====================
-- RLS POLICIES
-- =====================
-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for notifications (admin only)
CREATE POLICY "Admin can manage notifications" ON notifications FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for notification_targets (admin only)
CREATE POLICY "Admin can manage targets" ON notification_targets FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for notification_logs (admin only)
CREATE POLICY "Admin can view logs" ON notification_logs FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for chat_presence (users can manage their own)
CREATE POLICY "Users can manage own presence" ON chat_presence FOR ALL USING (auth.uid()::text = user_id::text);

-- Policies for messages (users can see their order messages)
CREATE POLICY "Users can see messages for their orders" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = messages.order_id
    AND (orders.utilisateur_id = auth.uid() OR orders.vendeur_id = auth.uid())
  )
);
CREATE POLICY "Users can insert messages for their orders" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = messages.order_id
    AND (orders.utilisateur_id = auth.uid() OR orders.vendeur_id = auth.uid())
  )
);
-- =====================
-- TABLE CHAT_PRESENCE
-- =====================
CREATE TABLE chat_presence (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_cp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cp_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_cp_user_order ON chat_presence(user_id, order_id);
CREATE INDEX idx_cp_active ON chat_presence(is_active);
-- =====================
-- TABLE NOTIFICATION_PRESETS
-- =====================
CREATE TABLE notification_presets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('info', 'warning', 'promo', 'system')) DEFAULT 'info',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_np_admin FOREIGN KEY (created_by) REFERENCES users(id)
);