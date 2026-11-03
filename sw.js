// Service Worker: macht die Startseite installierbar und hält sie für den Start ohne Netz bereit.
// Die Revier-Daten kommen weiter live von Google – offline zeigt die Startseite nur einen Hinweis.
var CACHE = 'jagd-v2';
var DATEIEN = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(DATEIEN); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (alle) {
    return Promise.all(alle.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

// Erst Netz (immer der neueste Stand), bei Funkloch aus dem Speicher
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (antwort) {
    var kopie = antwort.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request.mode === 'navigate' ? 'index.html' : e.request, kopie); });
    return antwort;
  }).catch(function () {
    return caches.match(e.request.mode === 'navigate' ? 'index.html' : e.request, { ignoreSearch: true });
  }));
});
