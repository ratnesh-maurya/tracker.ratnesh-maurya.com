'use client';

export const SW_UPDATE_EVENT = 'pwa:update-available';

let waitingWorker: ServiceWorker | null = null;
let reloadRequested = false;

function announce(worker: ServiceWorker) {
  waitingWorker = worker;
  window.dispatchEvent(new Event(SW_UPDATE_EVENT));
}

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const register = () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // A worker may already be waiting from an earlier visit.
        if (registration.waiting && navigator.serviceWorker.controller) {
          announce(registration.waiting);
        }
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              announce(worker);
            }
          });
        });
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });

    // Reload only when the user accepted the update, never on its own.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadRequested) window.location.reload();
    });
  };

  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}

export function hasWaitingUpdate() {
  return waitingWorker !== null;
}

export function applyUpdate() {
  if (!waitingWorker) return;
  reloadRequested = true;
  waitingWorker.postMessage({ type: 'SKIP_WAITING' });
}

export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
