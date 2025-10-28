const CACHE_NAME = "eshop-cache-v2";
const API_CACHE = "eshop-api-cache-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./cart.html",
  "./styles/main.css",
  "./script/cart.js",
  "./script/index.js",
  "./icon-192.png",
  "./icon-512.png",
  "./login.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching files...");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); 
});


self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name !== API_CACHE) {
            console.log("Deleting old cache:", name);
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});


self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

 
  if (url.origin !== location.origin || request.url.includes('/api/')) {
   
    event.respondWith(handleApiRequest(request));
  } else {
    
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).catch(() => caches.match("./index.html"))
        );
      })
    );
  }
});


 async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE); 
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log("Network failed, returning cached API data");
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
