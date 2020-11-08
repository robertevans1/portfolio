'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "manifest.json": "5de999a8934975948dc06b8742a00a51",
"main.dart.js": "3aef1d2dbe9e232f991f460ff84ec073",
"portfolio/flutter_apps/first_player_picker/assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"portfolio/flutter_apps/first_player_picker/assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"portfolio/flutter_apps/first_player_picker/assets/assets/ManSitting2.png": "7c54673bee013f2e6f523da9c3999237",
"portfolio/flutter_apps/first_player_picker/assets/assets/wine.png": "0bee6f2cf8da5bbe94ec6f13a6258ec2",
"portfolio/flutter_apps/first_player_picker/assets/assets/ManSitting5.png": "a2b1b126fc07e7580beef95860b304ed",
"portfolio/flutter_apps/first_player_picker/assets/assets/rug.jpg": "698a28a2d148847df88d6a26916afd74",
"portfolio/flutter_apps/first_player_picker/assets/assets/ManSitting4.png": "12f2d65d88e70c5079831052d6241d8e",
"portfolio/flutter_apps/first_player_picker/assets/assets/ManSitting1.png": "a3a9ae3ba9b3e5f943f7bf73f5b45c14",
"portfolio/flutter_apps/first_player_picker/assets/assets/ManSitting11.png": "a65db01b1a8a12fc433cd780f82f8c8d",
"portfolio/flutter_apps/first_player_picker/assets/assets/ManSitting0.png": "b16ed2ca645d2349c69e2b52138ec833",
"portfolio/flutter_apps/first_player_picker/assets/assets/ManSitting7.png": "a3b0e5acdb3dd0113c648362f7833543",
"portfolio/flutter_apps/first_player_picker/assets/assets/ManSitting8.png": "24af67a4af93126b71c33ae508132f13",
"portfolio/flutter_apps/first_player_picker/assets/assets/ManSitting10.png": "93a4b680ef782590ce0bdef0d1016721",
"portfolio/flutter_apps/first_player_picker/assets/assets/ManSitting9.png": "9f1fd996579cc63b4a044805c5ee5b7b",
"portfolio/flutter_apps/first_player_picker/assets/assets/ManSitting6.png": "8cd0028a7bf35e04cf5047b65db6f0c6",
"portfolio/flutter_apps/first_player_picker/assets/assets/ManSitting3.png": "fec6f4709574dc0badc72d6d1b667859",
"portfolio/flutter_apps/first_player_picker/assets/NOTICES": "702df1c227af88eefb9a50d6cea876aa",
"portfolio/flutter_apps/first_player_picker/assets/AssetManifest.json": "edf220586a5900c92a98b0fd27c93657",
"portfolio/flutter_apps/first_player_picker/assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"index.html": "a9f782bcc0f3fa28490090fd89df2f13",
"/": "a9f782bcc0f3fa28490090fd89df2f13",
"version.json": "8ccca570bbf9cf600e585a0de7ec20bb"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"portfolio/flutter_apps/first_player_picker/assets/NOTICES",
"portfolio/flutter_apps/first_player_picker/assets/AssetManifest.json",
"portfolio/flutter_apps/first_player_picker/assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
