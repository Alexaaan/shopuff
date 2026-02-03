'use client';

import { useState, useEffect } from 'react';

const CURRENT_VERSION = '1.1.1'; // Update this when deploying new version

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if app is already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true ||
                       (window.navigator as any).msStandalone === true ||
                       (window as any).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS device
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if user has dismissed the banner or if there's a new version
    const dismissedVersion = localStorage.getItem('pwa-banner-dismissed-version');
    const hasNewVersion = dismissedVersion !== CURRENT_VERSION;

    if (!standalone && hasNewVersion) {
      // Delay showing banner to avoid flashing
      setTimeout(() => setShowBanner(true), 1000);
    }

    // Listen for install prompt (Android/Chrome only)
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
    // For iOS, show instructions
    if (isIOS) {
      alert('Pour installer l\'app sur iPhone/iPad:\n\n1. Appuyez sur le bouton Partager Safari 📤\n2. Faites défiler et appuyez sur "Ajouter à l\'écran d\'accueil" ➕\n3. Appuyez sur "Ajouter" pour confirmer');
      return;
    }

    // For Android/Chrome
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

  // Don't show if user dismissed the current version or app is already installed
  if (!showBanner || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pwa-banner animate-in slide-in-from-bottom duration-300">
      <div className="max-w-lg mx-auto p-4">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">📱</div>
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1">
                {isIOS ? 'Installez Shopuff sur votre appareil' : 'Installez l\'app Shopuff'}
              </h4>
              <p className="text-purple-100 text-sm mb-4">
                {isIOS 
                  ? 'Recevez les notifications push et accédez à l\'app hors ligne'
                  : 'Recevez les notifications push des messages et commandes en temps réel'}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={handleInstall}
                  className="flex-1 bg-white text-purple-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-purple-50 transition-colors shadow-lg"
                >
                  {isIOS ? '📋 Comment installer' : '⚡ Installer'}
                </button>
                <button 
                  onClick={handleDismiss}
                  className="px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors font-medium"
                >
                  Plus tard
                </button>
              </div>
            </div>
            <button 
              onClick={handleDismiss}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
