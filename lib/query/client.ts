import { MutationCache, QueryClient, isServer } from '@tanstack/react-query';
import { idbPersister } from './persister';
import { SYNC_ERROR_EVENT, isOfflineMutation, registerOfflineMutations } from '@/lib/offline/queue';

const DAY = 24 * 60 * 60 * 1000;

// Persisted data older than this is discarded on launch.
export const PERSIST_MAX_AGE = 7 * DAY;

// Bump to invalidate every device's persisted cache after a response-shape change.
export const PERSIST_BUSTER = 'v1';

function makeQueryClient() {
    const client: QueryClient = new QueryClient({
        mutationCache: new MutationCache({
            // Queued saves can finish long after the page that made them is gone
            // (or after a restart), so refresh and report from here, not the page.
            onSettled: (_data, _error, _vars, _context, mutation) => {
                if (isOfflineMutation(mutation)) client.invalidateQueries();
            },
            onError: (error, _vars, _context, mutation) => {
                if (isOfflineMutation(mutation) && typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent(SYNC_ERROR_EVENT, { detail: (error as Error).message }));
                }
            },
        }),
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                // Must be >= PERSIST_MAX_AGE or queries are dropped before they are persisted.
                gcTime: PERSIST_MAX_AGE,
                refetchOnWindowFocus: false,
                retry: (failureCount, error: any) => {
                    if (error?.status === 401 || error?.response?.status === 401) return false;
                    return failureCount < 3;
                },
            },
        },
    });
    // Before the persisted cache is restored, so restored saves know how to send.
    registerOfflineMutations(client);
    return client;
}

let browserQueryClient: QueryClient | undefined;

// One client per browser tab; a fresh one per server render so users never share a cache.
export function getQueryClient() {
    if (isServer) return makeQueryClient();
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
}

// Removes everything cached for the current user: in-memory queries, queued
// saves, the persisted copy and any pages the service worker kept.
export async function clearUserData() {
    if (isServer) return;
    const client = getQueryClient();
    client.clear();
    client.getMutationCache().clear();
    await idbPersister.removeClient();
    if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.filter((n) => n.startsWith('pt-pages-')).map((n) => caches.delete(n)));
    }
}
