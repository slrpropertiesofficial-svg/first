const TTL = 120;
const DATA_PATH = "/__cache/properties";
const PURGE_PATHS = [DATA_PATH, "/sitemap.xml", "/llms.txt"];

export async function cachedProperties(origin, waitUntil, load) {
  const key = new Request(origin + DATA_PATH);
  const hit = await caches.default.match(key);
  if (hit) {
    try { return await hit.json(); } catch { }
  }
  const data = await load();
  waitUntil(caches.default.put(key, new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${TTL}` } })));
  return data;
}

export const purgeCaches = (origin) => Promise.all(PURGE_PATHS.map((p) => caches.default.delete(new Request(origin + p))));
