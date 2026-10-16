import { GROUPS } from "../../src/utils/categories.js";
import { gallery, isVideo, isoDate, propertyPath } from "../../src/utils/property.js";
import { collectionInfo, collectionPath } from "../../src/utils/routes.js";
import { locationsOf } from "../../src/utils/filters.js";
import { absUrl } from "../../src/utils/seo.js";
import { SITE } from "../../src/utils/site.js";
import { EMAIL, PHONE_PRETTY, WA } from "../../src/utils/contact.js";

const xml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
const newest = (list) => list.map((p) => isoDate(p.updated_at || p.created_at)).filter(Boolean).sort().at(-1);

export function robotsTxt(origin) {
  return [
    "User-agent: *",
    "Allow: /",
    "Allow: /api/images/",
    "Disallow: /admin",
    "Disallow: /api/",
    "Disallow: /favorites",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
}

function collectionRoutes(all) {
  const routes = [{ path: "/properties" }];
  for (const g of GROUPS) {
    routes.push({ group: g.id, path: collectionPath({ group: g.id }) });
    for (const sub of g.subs) routes.push({ group: g.id, sub, path: collectionPath({ group: g.id, sub }) });
  }
  for (const area of locationsOf(all)) routes.push({ area, path: collectionPath({ area }) });
  return routes
    .map((r) => ({ r, list: collectionInfo(r, all).list }))
    .filter((x) => x.list.length > 0);
}

export function sitemapXml(all, origin) {
  const out = [];
  const add = (path, lastmod, images = []) => {
    out.push(
      `<url><loc>${xml(origin + path)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}` +
      images.map((u) => `<image:image><image:loc>${xml(u)}</image:loc></image:image>`).join("") + "</url>"
    );
  };
  add("/", newest(all));
  for (const { r, list } of collectionRoutes(all)) add(r.path, newest(list));
  for (const p of all) {
    const imgs = gallery(p).filter((u) => !isVideo(u)).slice(0, 10).map((u) => absUrl(origin, u));
    add(propertyPath(p), isoDate(p.updated_at || p.created_at), imgs);
  }
  add("/privacy");
  add("/terms");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${out.join("\n")}\n</urlset>\n`;
}

export function llmsTxt(all, origin) {
  const lines = [
    `# ${SITE.name}`,
    "",
    `> Real estate agency in India. Houses, apartments, villas, sites, agricultural land, layout plots and commercial rentals. ${SITE.tagline}`,
    "",
    "## Browse",
    `- [All properties](${origin}/properties)`,
    ...GROUPS.map((g) => `- [${g.label}](${origin}${collectionPath({ group: g.id })}): ${g.subs.join(", ")}`),
    "",
    "## Current listings",
    ...all.map((p) => `- [${p.title}](${origin}${propertyPath(p)}): ${p.location}, ${p.price_display}, ${Number(p.sqft).toLocaleString("en-IN")} sq.ft${p.status && p.status !== "Available" ? `, ${p.status}` : ""}`),
    "",
    "## Contact",
    `- Phone and WhatsApp: ${PHONE_PRETTY} (${WA})`,
    `- Email: ${EMAIL}`,
    `- [Privacy policy](${origin}/privacy)`,
    `- [Terms](${origin}/terms)`,
    "",
  ];
  return lines.join("\n");
}
