'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker } from '@/lib/pwa/register';
import { setupInstallPrompt, promptInstall, isInstallable } from '@/lib/pwa/install';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export function PWAInstaller() {
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Register service worker
        registerServiceWorker();

        // Setup install prompt
        setupInstallPrompt();

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        // Check if installable
        const checkInstallable = () => {
            if (isInstallable() && !isInstalled) {
                setShowInstallPrompt(true);
            }
        };

        // Check after a delay to allow prompt to register
        setTimeout(checkInstallable, 2000);

        // Listen for app installed
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowInstallPrompt(false);
        });
    }, [isInstalled]);

    const handleInstall = async () => {
        const installed = await promptInstall();
        if (installed) {
            setShowInstallPrompt(false);
            setIsInstalled(true);
        }
    };

    if (isInstalled || !showInstallPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center justify-between gap-3">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Install App</p>
                    <p className="text-xs text-gray-600">Add to home screen for quick access</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleInstall}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Download className="h-4 w-4 mr-1" />
                        Install
                    </Button>
                    <Button
                        onClick={() => setShowInstallPrompt(false)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

