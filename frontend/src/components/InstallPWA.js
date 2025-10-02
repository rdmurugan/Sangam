import React, { useState, useEffect } from 'react';
import '../styles/InstallPWA.css';

const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const MobileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
  </svg>
);

const DesktopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"/>
  </svg>
);

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installInstructions, setInstallInstructions] = useState(null);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event for later use
      setDeferredPrompt(e);
      // Show the install banner
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was successfully installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowInstallBanner(false);
    });

    // For browsers that don't support beforeinstallprompt (iOS Safari)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS && !window.navigator.standalone) {
      // Show iOS-specific instructions
      setShowInstallBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS or browsers without install prompt support
      showManualInstructions();
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowInstallBanner(false);
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
  };

  const showManualInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isEdge = /Edg/.test(navigator.userAgent);

    if (isIOS) {
      setInstallInstructions({
        platform: 'iOS',
        steps: [
          'Tap the Share button (square with arrow)',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" in the top right corner'
        ]
      });
    } else if (isChrome || isEdge) {
      setInstallInstructions({
        platform: 'Desktop',
        steps: [
          'Click the install icon in the address bar',
          'Or click the three-dot menu → "Install Sangam"',
          'Follow the on-screen instructions'
        ]
      });
    } else if (isSafari) {
      setInstallInstructions({
        platform: 'Safari',
        steps: [
          'Click Safari → Settings → Websites',
          'Enable "Show Website Settings in Toolbar"',
          'Click the Aa icon → "Add to Home Screen"'
        ]
      });
    } else {
      setInstallInstructions({
        platform: 'Browser',
        steps: [
          'Look for the install icon in your browser',
          'Or check your browser menu for "Install App"',
          'Follow your browser\'s installation process'
        ]
      });
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Remember user dismissed (optional: use localStorage)
    localStorage.setItem('installBannerDismissed', 'true');
  };

  if (isInstalled) {
    return null; // Don't show banner if already installed
  }

  // Check if user previously dismissed
  if (localStorage.getItem('installBannerDismissed') === 'true' && !showInstallBanner) {
    return null;
  }

  if (!showInstallBanner) {
    return null;
  }

  return (
    <>
      <div className="install-pwa-banner">
        <div className="install-pwa-content">
          <div className="install-pwa-icon">
            <DownloadIcon />
          </div>
          <div className="install-pwa-text">
            <h4>Install Sangam App</h4>
            <p>Get the app experience - works on all devices!</p>
          </div>
          <div className="install-pwa-actions">
            <button className="install-pwa-btn-primary" onClick={handleInstallClick}>
              <DownloadIcon />
              Install App
            </button>
            <button className="install-pwa-btn-close" onClick={handleDismiss} title="Dismiss">
              <CloseIcon />
            </button>
          </div>
        </div>
      </div>

      {installInstructions && (
        <div className="install-instructions-modal" onClick={() => setInstallInstructions(null)}>
          <div className="install-instructions-content" onClick={(e) => e.stopPropagation()}>
            <div className="install-instructions-header">
              <h3>
                {installInstructions.platform === 'iOS' ? <MobileIcon /> : <DesktopIcon />}
                Install on {installInstructions.platform}
              </h3>
              <button onClick={() => setInstallInstructions(null)}>
                <CloseIcon />
              </button>
            </div>
            <div className="install-instructions-body">
              <p>Follow these steps to install Sangam:</p>
              <ol>
                {installInstructions.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
            <div className="install-instructions-footer">
              <button className="install-close-btn" onClick={() => setInstallInstructions(null)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWA;
