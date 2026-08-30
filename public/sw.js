/*
 * Offline support for 心理肌肉鍛鍊.
 *
 * Written defensively, because this app has already been through a
 * multi-day outage caused by a stale cache: a service worker is the one
 * mechanism that can make "stuck on an old build" permanent rather than
 * merely annoying. Every rule below exists to keep that from happening.
 *
 *   1. Navigations are NETWORK-FIRST. The HTML is the thing that points at
 *      the current build; serving it from cache first is exactly how an app
 *      gets frozen on an old version. Cache is the offline fallback only.
 *   2. Only /assets/ is cache-first, because those filenames contain a
 *      content hash - a given URL's bytes can never change, so cache-first
 *      is safe there by construction, and a new build simply asks for new
 *      URLs.
 *   3. Nothing cross-origin is touched: not Supabase, not the AI providers,
 *      not the fonts. Caching a Supabase response would mean serving stale
 *      personal data; caching an AI call would be meaningless and possibly
 *      sensitive.
 *   4. Only GET, and only 200 OK from our own origin, ever enters the cache.
 *   5. There is no skipWaiting(). A new worker takes over once the old
 *      pages are gone rather than swapping the running app's code out from
 *      under it. Updates still arrive immediately regardless: rule 1 means
 *      every navigation fetches fresh HTML, and the new hashed asset URLs
 *      it references miss the cache and go to the network.
 */

const VERSION = "__BUILD_COMMIT__";
const CACHE = `ms-${VERSION}`;
const SCOPE = new URL(self.registration.scope);
/** Documents are all cached under this one key: the app is a hash router, so
 *  every route is the same HTML, and cache-busting query strings (?_v=…)
 *  must not each add an entry of their own. */
const DOC_KEY = SCOPE.href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(new Request(DOC_KEY, { cache: "reload" })))
      // A failed precache must not abort the install: the worker is still
      // useful, it just has nothing to serve until the first online visit.
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))),
      )
      .then(() => self.clients.claim()),
  );
});

function isOurs(url) {
  return url.origin === SCOPE.origin && url.pathname.startsWith(SCOPE.pathname);
}

async function cachePut(key, response) {
  // Opaque and error responses are never stored - caching a 404 or a failed
  // range response is how a cache poisons itself.
  if (!response || !response.ok || response.type !== "basic") return;
  const cache = await caches.open(CACHE);
  await cache.put(key, response.clone());
}

async function handleDocument(request) {
  try {
    const fresh = await fetch(request);
    await cachePut(DOC_KEY, fresh);
    return fresh;
  } catch (err) {
    const cached = await caches.match(DOC_KEY);
    if (cached) return cached;
    throw err;
  }
}

async function handleAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  await cachePut(request, fresh);
  return fresh;
}

async function handleOther(request) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then(async (fresh) => {
      await cachePut(request, fresh);
      return fresh;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!isOurs(url)) return; // cross-origin: leave it entirely alone

  if (request.mode === "navigate") {
    event.respondWith(handleDocument(request));
    return;
  }
  if (url.pathname.includes("/assets/")) {
    event.respondWith(handleAsset(request));
    return;
  }
  event.respondWith(handleOther(request));
});

// Lets the app hand back a clean slate without the user having to find
// their browser's site-data settings.
self.addEventListener("message", (event) => {
  if (event.data === "ms-reset") {
    event.waitUntil(
      caches
        .keys()
        .then((names) => Promise.all(names.map((n) => caches.delete(n))))
        .then(() => self.registration.unregister()),
    );
  }
});
