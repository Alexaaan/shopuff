-- Add read_at column to messages table for read receipts
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Add client_id column for deduplication
ALTER TABLE messages ADD COLUMN IF NOT EXISTS client_id TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_order_id_read_at 
ON messages(order_id, read_at);

CREATE INDEX IF NOT EXISTS idx_messages_client_id 
ON messages(client_id);

-- Add index for presence tracking
CREATE INDEX IF NOT EXISTS idx_chat_presence_user_order 
ON chat_presence(user_id, order_id);
