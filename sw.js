// Service Worker — Presensi Nasaku v2.0
// Ganti versi CACHE_NAME setiap ada update agar cache diperbarui

var CACHE_NAME = 'nasaku-v2';
var CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// Install — simpan file ke cache
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c) {
      return c.addAll(CACHE_FILES);
    })
  );
});

// Activate — hapus cache lama
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// Fetch — network-first untuk GAS, cache-first untuk aset
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Jangan cache request ke GAS
  if (url.indexOf('script.google.com') >= 0) return;

  e.respondWith(
    fetch(e.request)
      .then(function(resp) {
        // Simpan ke cache jika sukses
        var copy = resp.clone();
        caches.open(CACHE_NAME).then(function(c){ c.put(e.request, copy); });
        return resp;
      })
      .catch(function() {
        // Jika offline, ambil dari cache
        return caches.match(e.request).then(function(r) {
          return r || new Response('Offline', { status: 503 });
        });
      })
  );
});
