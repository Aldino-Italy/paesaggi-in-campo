/* Paesaggi in campo. Service worker: guscio dell'app precaricato, figure e tessere di carta salvate quando vengono viste
   o quando l'utente le scarica in blocco da «Prepara l'uso offline». */
const V = "v1.1.3";
const SHELL = "pic-shell-" + V, TILES = "pic-tiles-v1", IMGS = "pic-imgs-v1";
const SHELL_FILES = ["./", "index.html", "app.css", "app.js", "manifest.webmanifest", "data/vajont.js", "data/carso.js", "data/routes.js", "data/installa.js",
  "vendor/leaflet.js", "vendor/leaflet.css", "vendor/images/marker-icon.png", "vendor/images/marker-icon-2x.png", "vendor/images/marker-shadow.png", "vendor/images/layers.png", "vendor/images/layers-2x.png",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png", "img/cover_vajont.jpg", "img/cover_carso.jpg", "img/ritrovo1.jpg", "img/ritrovo2.jpg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => Promise.all(SHELL_FILES.map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("pic-shell-") && k !== SHELL).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const isTile = u => /tile\.opentopomap\.org|tile\.openstreetmap\.org/.test(u.host);
const tileKey = u => u.href.replace(/\/\/[abc]\.tile\./, "//tile.");

self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (isTile(u)) {
    e.respondWith(caches.open(TILES).then(async c => {
      const key = tileKey(u); const hit = await c.match(key); if (hit) return hit;
      try { const r = await fetch(req); if (r.ok) c.put(key, r.clone()); return r; } catch (err) { return new Response("", { status: 504 }); }
    }));
    return;
  }
  if (u.origin !== location.origin) return;
  if (/\/img\//.test(u.pathname) || /\/audio\//.test(u.pathname) || /\/docs\//.test(u.pathname)) {
    e.respondWith(caches.open(IMGS).then(async c => {
      const hit = await c.match(req); if (hit) return hit;
      try { const r = await fetch(req); if (r.ok && !/\/docs\//.test(u.pathname)) c.put(req, r.clone()); return r; } catch (err) { return new Response("", { status: 504 }); }
    }));
    return;
  }
  // guscio: prima la cache, poi la rete; le navigazioni cadono su index.html
  e.respondWith(caches.open(SHELL).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true }); if (hit) { fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); }).catch(() => {}); return hit; }
    try { const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r; }
    catch (err) { if (req.mode === "navigate") return c.match("index.html"); return new Response("", { status: 504 }); }
  }));
});
