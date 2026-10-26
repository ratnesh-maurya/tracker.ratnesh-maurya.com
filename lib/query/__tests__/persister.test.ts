import { idbPersister } from '../persister';

// jsdom has no IndexedDB: the persister must degrade to a no-op, never throw.
describe('idbPersister without IndexedDB', () => {
    it('restores nothing and does not throw', async () => {
        expect(typeof indexedDB).toBe('undefined');
        await expect(idbPersister.persistClient({ timestamp: 0, buster: '', clientState: { queries: [], mutations: [] } })).resolves.toBeUndefined();
        await expect(idbPersister.restoreClient()).resolves.toBeUndefined();
        await expect(idbPersister.removeClient()).resolves.toBeUndefined();
    });
});
