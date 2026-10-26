import { MutationCache, QueryClient, dehydrate, hydrate, onlineManager } from '@tanstack/react-query';
import {
    CHECKIN_KEY,
    addPendingEntry,
    createKey,
    isOfflineMutation,
    newClientId,
    registerOfflineMutations,
    shouldRetry,
} from '../queue';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function newClient() {
    const client = new QueryClient({ mutationCache: new MutationCache() });
    registerOfflineMutations(client);
    return client;
}

function mockFetchOk() {
    const fetchMock = jest.fn().mockResolvedValue({ status: 201, json: async () => ({ success: true, data: { _id: 'srv1' } }) });
    global.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
}

afterEach(() => onlineManager.setOnline(true));

describe('offline queue', () => {
    it('keeps a save made offline across a restart and sends it once when back online', async () => {
        const fetchMock = mockFetchOk();
        onlineManager.setOnline(false);

        // Session 1: save while offline; nothing is sent.
        const before = newClient();
        const vars = { date: '2026-10-27', amount: 120, category: 'Food', currency: 'INR', clientId: newClientId() };
        before.getMutationCache().build(before, { mutationKey: createKey('expenses') }).execute(vars).catch(() => {});
        await Promise.resolve();
        expect(fetchMock).not.toHaveBeenCalled();

        // App closes: only paused offline saves are persisted.
        const persisted = dehydrate(before, {
            shouldDehydrateMutation: (m) => m.state.isPaused && isOfflineMutation(m),
        });
        expect(persisted.mutations).toHaveLength(1);

        // Session 2: restore, come back online, resume.
        const after = newClient();
        hydrate(after, persisted);
        onlineManager.setOnline(true);
        await after.resumePausedMutations();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('/api/expenses');
        expect(JSON.parse(init.body)).toEqual(vars);
    });

    it('sends habit check-ins to that habit with date and value only', async () => {
        const fetchMock = mockFetchOk();
        const client = newClient();
        await client
            .getMutationCache()
            .build(client, { mutationKey: CHECKIN_KEY })
            .execute({ habitId: 'h1', date: '2026-10-27T00:00:00.000Z', value: true });

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('/api/habits/h1/checkins');
        expect(JSON.parse(init.body)).toEqual({ date: '2026-10-27T00:00:00.000Z', value: true });
    });

    it('retries network and server errors but not bad input', () => {
        expect(shouldRetry(0, new TypeError('Failed to fetch'))).toBe(true);
        expect(shouldRetry(0, { status: 503 })).toBe(true);
        expect(shouldRetry(0, { status: 400 })).toBe(false);
        expect(shouldRetry(3, { status: 503 })).toBe(false);
    });

    it('makes v4 UUIDs, with or without crypto.randomUUID', () => {
        expect(newClientId()).toMatch(UUID_V4);
        const original = crypto.randomUUID;
        Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
        try {
            expect(newClientId()).toMatch(UUID_V4);
        } finally {
            Object.defineProperty(crypto, 'randomUUID', { value: original, configurable: true });
        }
    });
});

describe('addPendingEntry', () => {
    it('puts the entry first in a loaded list', () => {
        const old = { entries: [{ _id: 'a' }], pagination: { page: 1 } };
        expect(addPendingEntry(old, { _id: 'local-1' })).toEqual({
            entries: [{ _id: 'local-1' }, { _id: 'a' }],
            pagination: { page: 1 },
        });
    });

    it('leaves a list that has not loaded untouched', () => {
        expect(addPendingEntry(undefined, { _id: 'x' })).toBeUndefined();
    });
});
