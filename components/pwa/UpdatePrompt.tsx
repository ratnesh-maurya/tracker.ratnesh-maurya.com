'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { SW_UPDATE_EVENT, applyUpdate, hasWaitingUpdate } from '@/lib/pwa/register';

// Shown when a new version has downloaded. The app reloads only when the user
// taps "Reload", so nothing half-typed is lost.
export function UpdatePrompt() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (hasWaitingUpdate()) setReady(true);
        const onUpdate = () => setReady(true);
        window.addEventListener(SW_UPDATE_EVENT, onUpdate);
        return () => window.removeEventListener(SW_UPDATE_EVENT, onUpdate);
    }, []);

    if (!ready) return null;

    return (
        <div
            role="status"
            className="glass saffron-hairline fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:w-96 z-50 flex items-center gap-3 rounded-full py-2 pl-5 pr-2 shadow-pop"
        >
            <p className="flex-1 text-sm text-foreground">A new version is ready.</p>
            <button
                type="button"
                onClick={applyUpdate}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:[background:color-mix(in_srgb,hsl(var(--primary))_82%,hsl(var(--kumkum)))]"
            >
                <RefreshCw className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                Reload
            </button>
        </div>
    );
}
