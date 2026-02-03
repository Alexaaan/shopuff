// Play notification sound
export async function playNotificationSound(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = new Audio('/notification.mp3');
    await audio.play();
  } catch {
    // Ignore errors (no audio file, user interaction not allowed, etc.)
  }
}

// Preload audio for better performance
export function preloadNotificationSound(): void {
  if (typeof window === 'undefined') return;
  
  const audio = new Audio('/notification.mp3');
  audio.preload = 'auto';
}
