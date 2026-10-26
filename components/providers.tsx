'use client';

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ToastProvider } from '@/components/ui/toast-provider';
import { ThemeSync } from '@/components/theme-sync';
import { getQueryClient, PERSIST_BUSTER, PERSIST_MAX_AGE } from '@/lib/query/client';
import { idbPersister } from '@/lib/query/persister';
import { isOfflineMutation } from '@/lib/offline/queue';

export function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient();

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister: idbPersister,
                maxAge: PERSIST_MAX_AGE,
                buster: PERSIST_BUSTER,
                dehydrateOptions: {
                    shouldDehydrateQuery: (query) => query.state.status === 'success',
                    // Only queued saves: they have registered defaults, so they can resume
                    shouldDehydrateMutation: (mutation) => mutation.state.isPaused && isOfflineMutation(mutation),
                },
            }}
            // Send saves queued in an earlier session (no-op while still offline)
            onSuccess={() => queryClient.resumePausedMutations()}
        >
            <ToastProvider>
                <ThemeSync />
                {children}
            </ToastProvider>
        </PersistQueryClientProvider>
    );
}
