const CACHE_NAME = "heliora-royaumes-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./src/main.js",
  "./data/game-content.json",
  "./manifest.webmanifest",
  "./pwa-icon-192.png",
  "./pwa-icon-512.png",
  "./citadel-redesign.png",
  "./world-heliora-map.png",
  "./hero-reference.png",
  "./hero2.png",
  "./saya-astral.png",
  "./kael-crimson.png",
  "./lyra-lunar.png",
  "./aurelion-african-power.png",
  "./nyxara-african-power.png",
  "./draven-african-power.png",
  "./seraphine-african-power.png",
  "./ragnar-african-power.png",
  "./celestia-african-power.png",
  "./varkhan-dragon.png",
  "./isolde-frost.png",
  "./morvane-necro.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached ?? caches.match("./index.html")))
  );
});
