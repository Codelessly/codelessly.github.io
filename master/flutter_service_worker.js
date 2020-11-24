'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "2ba54df2b68ad225c21b365ac73190f3",
"main.dart.js": "986ab65854324e27fb8aaa8557506415",
"index.html": "82ad428bba66fda7e695966bc32e71b2",
"/": "82ad428bba66fda7e695966bc32e71b2",
"favicon.png": "e90970289dac1c88a078f4acaa7b6c63",
"assets/AssetManifest.json": "23976c2a737432f9e68dda1184360e14",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/FontManifest.json": "83e38acaa82e614610918e3f4a16fb03",
"assets/packages/flutter_dropzone_web/assets/flutter_dropzone.js": "5ee1f285611168cd6df377fd21151aae",
"assets/assets/fonts/sf_pro_text.ttf": "85bd46c1cff02c1d8360cc714b8298fa",
"assets/assets/fonts/sf_pro_display.otf": "5810cdf5bc7db8d0090a6c46890ee33b",
"assets/assets/fonts/sf_pro_display_medium.otf": "fb9b9cc0d18e37d34fee679aa55d7f3f",
"assets/assets/fonts/product_sans_regular.ttf": "eae9c18cee82a8a1a52e654911f8fe83",
"assets/assets/fonts/sf_pro_display_bold.otf": "01a151b865c124f88ef147e5592bae76",
"assets/assets/fonts/product_sans_bold.ttf": "dba0c688b8d5ee09a1e214aebd5d25e4",
"assets/assets/images/icon_container.png": "dfc1bcb79834fda7ffa5dfce06213aa4",
"assets/assets/images/codelessly_logo_no_background_128x.png": "e1dba5639cab54e28433ad44737bd7ec",
"assets/assets/images/icon_cursor.png": "cace3bd4e8dd6eab330f9b3244e70495",
"assets/assets/images/icon_link_96x.png": "201ae05544a53d3b8cfa1b3fac9923e5",
"assets/assets/images/icon_convert.png": "a25be5b352f97fa1edf2e27d47fdb8f9",
"assets/assets/images/icon_unwrap.png": "ccc81bb3b848812e90f61becb52f0a4a",
"assets/assets/images/icon_layers.png": "f140a5deef2a6e2c69508e2073a72841",
"assets/assets/images/icon_angle_100x.png": "7b6c151e3a5243724c362d10f22734fb",
"assets/assets/images/icon_link_broken_96x.png": "c022c854891ae5097221a0318a46c546",
"assets/assets/images/icon_add.png": "a62aab79200ebf4508746b6785ec2b80",
"assets/assets/images/icon_link_96x_colored.png": "26eb9b15c293f0c44f60eb971c8dfb28",
"assets/assets/images/google_logo.png": "640b004d01a7e1ed6b32c117d5d6754f",
"assets/assets/images/icon_wrap.png": "0df8d366c3a5f2f82ff80d6ec5ecf4d6",
"assets/assets/images/icon_text.png": "edddf6a8219ad63216ea0c514a3ee829",
"assets/assets/images/icon_edit_128x.png": "72cf5eb34c2960776f4f61ae647d1f38",
"assets/assets/images/icon_aspect_ratio_96x.png": "8f90e08677e779b9cb0579d3357d0efa",
"assets/assets/images/icon_canvas.png": "4a2397a88eb03c42a5a3f5446704582c",
"assets/assets/images/icon_delete.png": "812c03559a8e3e6fcabc0d7afb371da4",
"assets/NOTICES": "291b33dbb67c627ef0ca6c93fcbc8439",
"manifest.json": "bb89a551920fee2902ced31eec3f291a",
"icons/Icon-192.png": "35d68ed053ca0410400d77ccb24dda58",
"icons/Icon-512.png": "c6b78c233e3f49478b76758f35f33190"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
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
