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
            className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:w-80 z-50 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1a1a2e] p-3 pl-4 shadow-2xl shadow-black/40"
        >
            <p className="flex-1 text-sm text-gray-200">A new version is ready.</p>
            <button
                type="button"
                onClick={applyUpdate}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Reload
            </button>
        </div>
    );
}
