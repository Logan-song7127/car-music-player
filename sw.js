const CACHE_NAME='car-player-hybrid-v1';
const APP_SHELL=['index.html', 'style.css', 'app.js', 'manifest.json', 'icon.png'];

self.addEventListener('install', (event) =>{
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache)=>cache.addAll(APP_SHELL))
	);
});
self.addEventListener('activate',(event)=>{
	event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) =>{
	event.respondWith(
		fetch(event.request). then((networkResponse) =>{
			if(networkResponse&&networkResponse.status===200){
				const responseClone=networkResponse.clone();
				caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
				}
				return networkResponse;
			})
			.catch(()=>{
				return caches.match(event.request);
			})
		);
});