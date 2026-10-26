import type { Mutation, QueryClient } from '@tanstack/react-query';
import { handleApiResponse } from '@/lib/api/client';

// Saves that may be made offline. They wait in a queue, survive app restarts
// (persisted with the query cache) and are sent in order once back online.
//
// expenses/food/study send a device-made `clientId` so a retry returns the
// first copy; sleep, journal and habit check-ins already overwrite by day.
export const OFFLINE_ENTITIES = ['expenses', 'food', 'study', 'sleep', 'journal'] as const;
export type OfflineEntity = (typeof OFFLINE_ENTITIES)[number];

export const createKey = (entity: OfflineEntity) => ['offline', 'create', entity] as const;
export const CHECKIN_KEY = ['offline', 'checkin'] as const;

export const SYNC_ERROR_EVENT = 'offline:sync-error';

export interface CheckInVars {
    habitId: string;
    date: string;
    value: boolean | number;
}

// One scope: queued saves run one at a time, oldest first.
const scope = { id: 'offline-queue' };

async function postJson<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleApiResponse<T>(res);
}

// Network drops and server errors are retried; a 4xx (bad input) never will succeed.
export function shouldRetry(failureCount: number, error: unknown) {
    const status = (error as { status?: number })?.status;
    return failureCount < 3 && (status === undefined || status >= 500);
}

export const isOfflineMutation = (mutation: Mutation<any, any, any, any>) =>
    mutation.options.mutationKey?.[0] === 'offline';

export function registerOfflineMutations(client: QueryClient) {
    for (const entity of OFFLINE_ENTITIES) {
        client.setMutationDefaults(createKey(entity), {
            mutationFn: (vars: Record<string, unknown>) => postJson(`/api/${entity}`, vars),
            retry: shouldRetry,
            scope,
        });
    }
    client.setMutationDefaults(CHECKIN_KEY, {
        mutationFn: ({ habitId, date, value }: CheckInVars) =>
            postJson(`/api/habits/${habitId}/checkins`, { date, value }),
        retry: shouldRetry,
        scope,
    });
}

// Puts a not-yet-synced entry at the top of a `{ entries, pagination }` list.
// Leaves anything else (not loaded yet, other shapes) untouched.
export function addPendingEntry(old: unknown, entry: Record<string, unknown>) {
    const list = old as { entries?: unknown[] } | undefined;
    if (!list || !Array.isArray(list.entries)) return old;
    return { ...list, entries: [entry, ...list.entries] };
}

// RFC 4122 v4; crypto.randomUUID needs a secure context, so fall back for http dev hosts.
export function newClientId(): string {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
