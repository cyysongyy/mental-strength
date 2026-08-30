/**
 * Service worker registration.
 *
 * Deliberately deferred until after load: registering during startup makes
 * the worker's install compete for bandwidth with the very assets the first
 * paint is waiting on, which is worst exactly where offline support matters
 * most - a slow phone connection.
 */
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    // Relative to the page, so it inherits the /mental-strength/ base and
    // therefore a scope covering the whole app and nothing above it.
    navigator.serviceWorker.register("sw.js").catch(() => {
      // An unavailable worker costs offline support and nothing else - the
      // app is fully functional without it, so a failure here is not worth
      // surfacing to the person using it.
    });
  });
}

/**
 * Removes the worker and every cache it holds, then reloads from the network.
 *
 * This exists because of what this app has already lived through: a stale
 * cache once made it look broken for days. Anyone who suspects that is
 * happening again needs a way out that does not involve finding their
 * browser's site-data settings.
 */
export async function resetServiceWorker(): Promise<void> {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
  } finally {
    // Query string so the reload cannot be answered from the HTTP cache
    // either - the worker is only one of the two layers that can go stale.
    location.replace(`${location.pathname}?_v=${Date.now()}${location.hash}`);
  }
}
