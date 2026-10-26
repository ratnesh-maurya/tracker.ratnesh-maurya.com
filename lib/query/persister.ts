import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

const DB_NAME = 'pt-cache';
const STORE = 'kv';
const KEY = 'react-query';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

async function run<T>(mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = op(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const available = () => typeof indexedDB !== 'undefined';

// Storage failures (private mode, quota) must never break the app: worst case
// the next launch starts with an empty cache.
export const idbPersister: Persister = {
  async persistClient(client: PersistedClient) {
    if (!available()) return;
    try {
      await run('readwrite', (s) => s.put(client, KEY));
    } catch {}
  },
  async restoreClient() {
    if (!available()) return undefined;
    try {
      return (await run<PersistedClient | undefined>('readonly', (s) => s.get(KEY))) ?? undefined;
    } catch {
      return undefined;
    }
  },
  async removeClient() {
    if (!available()) return;
    try {
      await run('readwrite', (s) => s.delete(KEY));
    } catch {}
  },
};
