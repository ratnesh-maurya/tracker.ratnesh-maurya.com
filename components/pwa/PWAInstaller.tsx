'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker } from '@/lib/pwa/register';
import { setupInstallPrompt, promptInstall, isInstallable } from '@/lib/pwa/install';
import { X } from 'lucide-react';

const DISMISS_KEY = 'pwa-install-dismissed-until';
// Show again after 7 days if dismissed
const SNOOZE_DAYS = 7;

export function PWAInstaller() {
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);

    useEffect(() => {
        registerServiceWorker();
        setupInstallPrompt();

        // Already installed as standalone
        if (window.matchMedia('(display-mode: standalone)').matches) return;

        // Check snooze
        const dismissedUntil = localStorage.getItem(DISMISS_KEY);
        if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;

        const checkInstallable = () => {
            if (isInstallable()) setShowInstallPrompt(true);
        };

        const t = setTimeout(checkInstallable, 3000);
        window.addEventListener('appinstalled', () => setShowInstallPrompt(false));
        return () => clearTimeout(t);
    }, []);

    const handleInstall = async () => {
        const installed = await promptInstall();
        if (installed) setShowInstallPrompt(false);
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        localStorage.setItem(DISMISS_KEY, String(Date.now() + SNOOZE_DAYS * 86400_000));
    };

    if (!showInstallPrompt) return null;

    return (
        <div
            role="dialog"
            aria-labelledby="pwa-install-title"
            className="glass saffron-hairline fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:w-[360px] z-50 animate-fade-in rounded-inner p-5 shadow-pop"
        >
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    <p className="eyebrow">Install</p>
                    <p id="pwa-install-title" className="mt-1.5 font-display text-[22px] leading-[1.15]">
                        Keep it on your <em className="saffron">home screen</em>
                    </p>
                    <p className="mt-1.5 text-sm text-muted-foreground">Opens instantly, works offline and syncs when you are back.</p>
                </div>
                <button
                    type="button"
                    onClick={handleDismiss}
                    className="-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-150 hover:text-foreground"
                    aria-label="Dismiss"
                >
                    <X className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                </button>
            </div>
            <div className="mt-4 flex gap-2">
                <button
                    type="button"
                    onClick={handleInstall}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:[background:color-mix(in_srgb,hsl(var(--primary))_82%,hsl(var(--kumkum)))]"
                >
                    Install →
                </button>
                <button
                    type="button"
                    onClick={handleDismiss}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-input bg-card px-5 text-sm font-medium text-foreground transition-colors duration-150 hover:border-rule"
                >
                    Not now
                </button>
            </div>
        </div>
    );
}
