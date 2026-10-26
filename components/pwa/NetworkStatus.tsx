'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useMutationState } from '@tanstack/react-query';
import { WifiOff } from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';
import { SYNC_ERROR_EVENT } from '@/lib/offline/queue';

function subscribe(onChange: () => void) {
    window.addEventListener('online', onChange);
    window.addEventListener('offline', onChange);
    return () => {
        window.removeEventListener('online', onChange);
        window.removeEventListener('offline', onChange);
    };
}

export function useOnline() {
    return useSyncExternalStore(
        subscribe,
        () => navigator.onLine,
        () => true
    );
}

const plural = (n: number) => (n === 1 ? '1 change' : `${n} changes`);

export function NetworkStatus() {
    const online = useOnline();
    const { error: showError } = useToast();
    const queued = useMutationState({
        filters: { mutationKey: ['offline'], status: 'pending' },
        select: (mutation) => mutation.mutationId,
    }).length;

    useEffect(() => {
        const onError = (e: Event) => {
            const reason = (e as CustomEvent<string>).detail;
            showError(`A saved change could not sync${reason ? `: ${reason}` : ''}`);
        };
        window.addEventListener(SYNC_ERROR_EVENT, onError);
        return () => window.removeEventListener(SYNC_ERROR_EVENT, onError);
    }, [showError]);

    // Online saves take a moment; a banner there would flash on every save.
    if (online) return null;

    return (
        <div
            role="status"
            className="sticky top-0 z-40 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium bg-amber-500/15 text-amber-700 dark:text-amber-200 border-b border-amber-500/20 backdrop-blur-md"
        >
            <WifiOff className="h-3.5 w-3.5" aria-hidden />
            {queued > 0
                ? `Offline · ${plural(queued)} will sync when you are back online`
                : 'Offline · showing data saved on this device'}
        </div>
    );
}
