'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker } from '@/lib/pwa/register';
import { setupInstallPrompt, promptInstall, isInstallable } from '@/lib/pwa/install';
import { X, Download, Smartphone } from 'lucide-react';

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
        <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Smartphone className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">Add to Home Screen</p>
                        <p className="text-xs text-gray-400 mt-0.5">Install for faster access, offline support &amp; a native app feel</p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0 mt-0.5"
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={handleInstall}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Install
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-3 py-2 text-gray-400 hover:text-gray-200 text-sm rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        Not now
                    </button>
                </div>
            </div>
        </div>
    );
}
