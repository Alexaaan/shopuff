'use client';

import { useState, useEffect } from 'react';

const CURRENT_VERSION = '1.1.0'; // Update this when deploying new version

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if app is already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;

    // Check if user has dismissed the banner or if there's a new version
    const dismissedVersion = localStorage.getItem('pwa-banner-dismissed-version');
    const hasNewVersion = dismissedVersion !== CURRENT_VERSION;

    if (!isStandalone || hasNewVersion) {
      setShowBanner(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Store version in localStorage to show again for new versions
    localStorage.setItem('pwa-banner-dismissed-version', CURRENT_VERSION);
  };

  // Don't show if user dismissed the current version (client-side only)
  if (typeof window !== 'undefined') {
    const dismissedVersion = localStorage.getItem('pwa-banner-dismissed-version');
    if (!showBanner || dismissedVersion === CURRENT_VERSION) {
      return null;
    }
  } else if (!showBanner) {
    return null;
  }

  return (
    <div className="pwa-banner">
      <div className="pwa-banner-content">
        <div className="pwa-banner-icon">📱</div>
        <div className="pwa-banner-text">
          <h4>Installez Shopuff</h4>
          <p>Recevez les notifications push des messages et commandes en temps réel !</p>
        </div>
        <div className="pwa-banner-actions">
          <button onClick={handleInstall} className="pwa-install-btn">
            Installer l'app
          </button>
          <button onClick={handleDismiss} className="pwa-dismiss-btn">
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}