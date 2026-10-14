import { cachedProperties } from "./_lib/cache.js";
import { allProperties, ensureSchema } from "./_lib/db.js";
import { llmsTxt, robotsTxt, sitemapXml } from "./_lib/feeds.js";
import { SECURITY_HEADERS, redirect, siteOrigin } from "./_lib/http.js";
import { snapshotHtml } from "./_lib/snapshot.js";
import { matchRoute } from "../src/utils/routes.js";
import { escAttr, headHtml, jsonForScript, metaFor } from "../src/utils/seo.js";
import { HERO } from "../src/utils/site.js";

const NOINDEX_TYPES = new Set(["admin", "favorites", "notfound"]);
const EDGE_TTL = 180;

async function loadAll(env, url, waitUntil) {
  if (!env.DB) return null;
  try {
    return await cachedProperties(url.origin, waitUntil, async () => {
      await ensureSchema(env.DB);
      return allProperties(env.DB);
    });
  } catch (e) {
    console.error("D1 read failed", e);
    return null;
  }
}

function text(body, type, ttl) {
  return new Response(body, {
    headers: {
      "Content-Type": `${type}; charset=utf-8`,
      "Cache-Control": `public, max-age=0, s-maxage=${ttl}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function cached(request, waitUntil, build) {
  const cache = caches.default;
  const key = new Request(new URL(request.url).origin + new URL(request.url).pathname);
  if (request.method === "GET") {
    const hit = await cache.match(key);
    if (hit) {
      const res = new Response(hit.body, hit);
      res.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
      return res;
    }
  }
  const res = await build();
  if (request.method === "GET" && res.status === 200 && res.headers.get("X-Slr-Cache") === "1") {
    const copy = new Response(res.clone().body, res);
    copy.headers.set("Cache-Control", `public, max-age=${EDGE_TTL}`);
    copy.headers.delete("X-Slr-Cache");
    waitUntil(cache.put(key, copy));
    res.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  }
  res.headers.delete("X-Slr-Cache");
  return res;
}

async function renderPage({ request, env, waitUntil }, url, origin) {
  const all = await loadAll(env, url, waitUntil);
  const route = matchRoute(url.pathname, all || []);
  const ok = all !== null;

  if (ok && route.type === "property" && route.requested !== route.path) return redirect(origin + route.path);

  const meta = metaFor(route, all || [], origin);
  const shellRes = await env.ASSETS.fetch(new Request(new URL("/", url).toString()));
  const status = ok && route.type === "notfound" ? 404 : 200;
  const noindex = NOINDEX_TYPES.has(route.type) || meta.noindex;

  let extra = "";
  if (route.type === "home") {
    extra = `<link rel="preload" as="image" imagesrcset="${escAttr(HERO.srcSet)}" imagesizes="${HERO.sizes}" fetchpriority="high">`;
  }
  const boot = jsonForScript(ok ? { site: origin, properties: all } : { site: origin });
  const snapshot = ok ? snapshotHtml(route, all, origin) : "";

  const rewritten = new HTMLRewriter()
    .on("[data-seo]", { element(el) { el.remove(); } })
    .on("head", { element(el) { el.append(`${headHtml(meta, origin)}\n${extra}`, { html: true }); } })
    .on("#root", { element(el) { if (snapshot) el.setInnerContent(snapshot, { html: true }); } })
    .on("body", { element(el) { el.append(`<script type="application/json" id="slr-boot">${boot}</script>`, { html: true }); } })
    .transform(shellRes);

  const headers = new Headers({
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": status === 200 && ok ? "public, max-age=0, must-revalidate" : "no-store",
    ...SECURITY_HEADERS,
  });
  if (noindex) headers.set("X-Robots-Tag", route.type === "admin" ? "noindex, nofollow" : "noindex");
  return new Response(request.method === "HEAD" ? null : rewritten.body, { status, headers });
}

export async function onRequest(ctx) {
  const { request, env, waitUntil } = ctx;
  const url = new URL(request.url);

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  const origin = siteOrigin(env, url);
  if (env.SITE_URL && url.origin !== origin) return redirect(origin + url.pathname + url.search);

  const path = url.pathname;
  if (path !== "/" && path.endsWith("/")) return redirect(origin + path.replace(/\/+$/, "") + url.search);

  if (path === "/robots.txt") return text(robotsTxt(origin), "text/plain", 3600);
  if (env.INDEXNOW_KEY && path === `/${env.INDEXNOW_KEY}.txt`) return text(env.INDEXNOW_KEY, "text/plain", 86400);
  if (/\.[a-z0-9]+$/i.test(path) && path !== "/sitemap.xml" && path !== "/llms.txt") {
    const asset = await env.ASSETS.fetch(request);
    if ((asset.headers.get("Content-Type") || "").includes("text/html")) {
      return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
    }
    return asset;
  }

  if (path === "/sitemap.xml" || path === "/llms.txt") {
    return cached(request, waitUntil, async () => {
      const all = await loadAll(env, url, waitUntil);
      if (all === null) return new Response("Service unavailable", { status: 503, headers: { "Retry-After": "120" } });
      const res = path === "/sitemap.xml" ? text(sitemapXml(all, origin), "application/xml", EDGE_TTL) : text(llmsTxt(all, origin), "text/plain", EDGE_TTL);
      res.headers.set("X-Slr-Cache", "1");
      return res;
    });
  }

  return renderPage(ctx, url, origin);
}
