/* Asesor · service worker v01
   Hace una sola cosa: guarda la cáscara (index.html, manifest, íconos) para
   que la app abra al instante desde la pantalla de inicio y muestre algo
   aunque no haya señal. Los datos NO se cachean: vienen de Supabase y una
   agenda vieja es peor que una agenda que dice "sin conexión".
   Para el index.html se va a la red primero y se cae a la caché: así un
   cambio publicado se ve en la próxima apertura, sin esperar a que venza. */
const CACHE = 'asesor-v02';
const CASCARA = ['./', './index.html', './manifest.webmanifest', './icono-192.png', './icono-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CASCARA)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;   // Supabase y CDN pasan de largo
  e.respondWith(
    fetch(e.request).then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
