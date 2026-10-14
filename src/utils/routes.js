import { GROUPS, isRent } from "./categories.js";
import { idFromSlug, propertyPath, slugify } from "./property.js";
import { DEFAULT_FILTERS, filterProperties, locationsOf } from "./filters.js";
import { priceLabel } from "./format.js";
import { SITE } from "./site.js";

export function collectionPath({ group, sub, area } = {}) {
  if (area) return `/locations/${slugify(area)}`;
  if (group && sub) return `/properties/${group}/${slugify(sub)}`;
  if (group) return `/properties/${group}`;
  return "/properties";
}

const STATIC = { "/": "home", "/privacy": "privacy", "/terms": "terms", "/favorites": "favorites", "/admin": "admin" };

export function matchRoute(rawPath, all = []) {
  const path = String(rawPath || "/").replace(/\/+$/, "") || "/";
  if (STATIC[path]) return { type: STATIC[path], path };

  let m = path.match(/^\/property\/([^/]+)$/);
  if (m) {
    const id = idFromSlug(m[1]);
    const p = id ? all.find((x) => x.id === id) : null;
    return p ? { type: "property", id, p, path: propertyPath(p), requested: path } : { type: "notfound", path };
  }

  if (path === "/properties") return { type: "collection", path };

  m = path.match(/^\/properties\/([^/]+)(?:\/([^/]+))?$/);
  if (m) {
    const g = GROUPS.find((x) => x.id === m[1]);
    if (!g) return { type: "notfound", path };
    if (!m[2]) return { type: "collection", group: g.id, path };
    const sub = g.subs.find((s) => slugify(s) === m[2]);
    return sub ? { type: "collection", group: g.id, sub, path } : { type: "notfound", path };
  }

  m = path.match(/^\/locations\/([^/]+)$/);
  if (m) {
    const area = locationsOf(all).find((a) => slugify(a) === m[1]);
    return area ? { type: "collection", area, path } : { type: "notfound", path };
  }
  return { type: "notfound", path };
}

const GROUP_H1 = {
  residential: `Houses, Apartments & Villas for Sale in ${SITE.city}`,
  land: `Plots, Sites & Land for Sale in ${SITE.city}`,
  commercial: `Commercial Properties for Rent in ${SITE.city}`,
};

export function collectionInfo(route, all) {
  const { group, sub, area } = route;
  const list = filterProperties(all, { ...DEFAULT_FILTERS, group: group || "all", sub: sub || "all", location: area || "all" });
  const g = GROUPS.find((x) => x.id === group);

  let h1 = `Properties for Sale & Rent in ${SITE.city}`;
  if (area) h1 = `Properties in ${area}, ${SITE.city}`;
  else if (sub) h1 = `${sub} for ${g.id === "commercial" ? "Rent" : "Sale"} in ${SITE.city}`;
  else if (g) h1 = GROUP_H1[g.id];

  const n = list.length;
  const rents = list.filter(isRent).length;
  let range = "";
  if (n && (rents === 0 || rents === n)) {
    const prices = list.map((p) => Number(p.price)).filter((v) => v > 0);
    if (prices.length) {
      const lo = Math.min(...prices), hi = Math.max(...prices);
      const rent = rents === n;
      range = lo === hi ? `, priced at ${priceLabel(lo, rent)}` : `, priced from ${priceLabel(lo, rent)} to ${priceLabel(hi, rent)}`;
    }
  }
  const intro = n
    ? `${n} ${n === 1 ? "listing is" : "listings are"} available${range}. Every listing has photos, area, location, a map and a direct WhatsApp enquiry.`
    : `New listings in this category are coming soon. Message us on WhatsApp and we will tell you as soon as a matching property is available.`;

  const crumbs = [["Home", "/"], ["Properties", "/properties"]];
  if (g) crumbs.push([g.label, collectionPath({ group: g.id })]);
  if (sub) crumbs.push([sub, collectionPath({ group: g.id, sub })]);
  if (area) crumbs.push([area, collectionPath({ area })]);

  return { list, h1, intro, crumbs, group: g, sub, area };
}
