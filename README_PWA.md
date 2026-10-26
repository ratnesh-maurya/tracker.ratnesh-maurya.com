# PWA and offline

The tracker installs as an app, opens instantly from a saved copy of your data, and accepts new entries while offline.

## How it works

| Layer | What it does | Where |
|---|---|---|
| Service worker | Pages: network first, saved copy when offline. `/_next/static`: cache first (hashed, never changes). Images/fonts: stale-while-revalidate. **Never caches `/api`** (per-user data). | `public/sw.js` |
| Query cache | All successful API reads are saved to IndexedDB and restored at launch (7 days max), then refreshed in the background. | `lib/query/client.ts`, `lib/query/persister.ts` |
| Offline queue | Adds (expenses, food, study, sleep, journal) and habit check-ins go through a queue: shown at once, saved across restarts, sent in order when back online. | `lib/offline/queue.ts`, `lib/offline/useOfflineCreate.ts` |
| No duplicates | Expense, food and study creates send a device-made `clientId`; the server returns the first copy on a retry (unique index per user). Sleep, journal and check-ins overwrite by day. | `lib/api/idempotent.ts` |
| Updates | A new version waits until the user taps **Reload** in the "new version is ready" prompt; it never reloads mid-entry. | `lib/pwa/register.ts`, `components/pwa/UpdatePrompt.tsx` |

Logout, login, register and an expired session all wipe the cached data, the queue and saved pages (`clearUserData`), so the next person on the device sees nothing. Logout warns first if unsynced saves exist.

Editing and deleting still need a connection.

## Releasing a change

- **Changed `sw.js` caching rules:** bump `VERSION` in `public/sw.js`. Old caches are deleted on activation.
- **Changed an API response shape:** bump `PERSIST_BUSTER` in `lib/query/client.ts`, or devices restore data in the old shape.
- **Added a new kind of offline save:** register it in `registerOfflineMutations` (`lib/offline/queue.ts`). A queued save restored after a restart needs those defaults to know how to send itself.

## Manifest

`public/manifest.json`: `id` and `start_url` `/dashboard`, standalone display, dark `#0E0D0B` theme and background, separate `any` and `maskable` icons, and home-screen shortcuts for habits, expense, food and journal. No `screenshots` yet; adding them enables the richer install prompt on Android.

## Testing

```bash
npm run build:next && npx next start
```

1. **Install:** DevTools → Application → Manifest shows no errors; the install prompt appears after ~3 s (dismiss snoozes it for 7 days).
2. **Offline reads:** open a few pages, then DevTools → Network → Offline and reload. Pages show the saved data and the offline banner.
3. **Offline saves:** while offline, add an expense. It appears with a "Not synced" tag and the banner counts it. Reload (still offline): it is still queued. Go online: it syncs once, with no duplicate.
4. **Update prompt:** change `VERSION` in `sw.js`, rebuild, reload: the "new version is ready" prompt appears, and **Reload** switches over.
5. **Unit tests:** `npm test` covers the queue (offline → restart → sync once), the server de-duplication, the check-in merge and the persister fallback.

The service worker only registers over HTTPS or on localhost.
