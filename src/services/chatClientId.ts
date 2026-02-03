// Generate unique client ID for message deduplication
export function generateClientId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `msg_${timestamp}_${random}`;
}

// Validate client ID format
export function isValidClientId(id: string): boolean {
  return /^msg_\\d+_[a-z0-9]+$/.test(id);
}
