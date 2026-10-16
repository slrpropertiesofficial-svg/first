import { GROUPS, info, isRent } from "../../src/utils/categories.js";
import { gallery, isVideo, propertyPath } from "../../src/utils/property.js";
import { collectionInfo, collectionPath } from "../../src/utils/routes.js";
import { FAQ } from "../../src/utils/faq.js";
import { escAttr as a, escText as t, absUrl } from "../../src/utils/seo.js";
import { SITE } from "../../src/utils/site.js";
import { EMAIL, PHONE_PRETTY, TEL, WA } from "../../src/utils/contact.js";

const nav = () =>
  `<header><p><a href="/">${t(SITE.name)}</a></p><nav aria-label="Primary"><a href="/properties">All properties</a> ` +
  GROUPS.map((g) => `<a href="${collectionPath({ group: g.id })}">${t(g.label)}</a>`).join(" ") +
  ` <a href="/privacy">Privacy</a> <a href="/terms">Terms</a></nav></header>`;

const footer = () =>
  `<footer><p>${t(SITE.name)} - ${t(SITE.tagline)}</p><p><a href="${a(TEL)}">${t(PHONE_PRETTY)}</a> | <a href="mailto:${a(EMAIL)}">${t(EMAIL)}</a> | <a href="${a(WA)}">WhatsApp</a></p></footer>`;

const facts = (p) =>
  `${t(p.location)} | ${t(p.price_display)} | ${Number(p.sqft).toLocaleString("en-IN")} sq.ft${p.status && p.status !== "Available" ? ` | ${t(p.status)}` : ""}`;

const list = (items, limit = 60) =>
  `<ul>${items.slice(0, limit).map((p) => `<li><h3><a href="${a(propertyPath(p))}">${t(p.title)}</a></h3><p>${facts(p)}</p><p>${t(p.description)}</p></li>`).join("")}</ul>`;

const wrap = (inner) => `<div class="ssr">${nav()}<main>${inner}</main>${footer()}</div>`;

function home(all) {
  return wrap(
    `<h1>Find Your Perfect Property</h1><p>${t(SITE.tagline)}</p>` +
    `<p>Houses, apartments, villas, sites, agricultural land and commercial rental properties, with personal assistance at every step.</p>` +
    `<h2>Browse by category</h2><ul>${GROUPS.map((g) => `<li><a href="${collectionPath({ group: g.id })}">${t(g.label)}</a>: ${g.subs.map((s) => `<a href="${collectionPath({ group: g.id, sub: s })}">${t(s)}</a>`).join(", ")}</li>`).join("")}</ul>` +
    (all.length ? `<h2>Available real estate</h2>${list(all)}` : "") +
    `<h2>Before you enquire</h2><dl>${FAQ.map(([q, ans]) => `<dt>${t(q)}</dt><dd>${t(ans)}</dd>`).join("")}</dl>` +
    `<h2>Contact us</h2><p><a href="${a(WA)}">WhatsApp ${t(PHONE_PRETTY)}</a> | <a href="${a(TEL)}">Call</a> | <a href="mailto:${a(EMAIL)}">${t(EMAIL)}</a></p>`
  );
}

function collection(route, all) {
  const c = collectionInfo(route, all);
  const crumbs = c.crumbs.map(([label, to], i) => (i === c.crumbs.length - 1 ? `<span>${t(label)}</span>` : `<a href="${a(to)}">${t(label)}</a>`)).join(" &rsaquo; ");
  return wrap(`<nav aria-label="Breadcrumb">${crumbs}</nav><h1>${t(c.h1)}</h1><p>${t(c.intro)}</p>${c.list.length ? list(c.list) : ""}`);
}

function property(p, origin) {
  const { g, sub } = info(p.category);
  const rent = isRent(p);
  const img = gallery(p).find((u) => !isVideo(u));
  const rows = [
    ["Type", sub], ["Listing for", rent ? "Rent" : "Sale"], ["Location", p.location],
    ...(g?.id === "residential" ? [["Bedrooms", p.beds], ["Bathrooms", p.baths]] : []),
    ["Total area", `${Number(p.sqft || 0).toLocaleString("en-IN")} Sq.Ft`],
    ["Status", p.status || "Available"], ["Listing ref", `SLR-${p.id}`],
  ];
  const msg = `Hello SLR Properties, I would like to enquire about "${p.title}" (${p.location}, ${p.price_display}) - Listing #SLR-${p.id}.\n${origin}${propertyPath(p)}`;
  const crumbs = `<a href="/">Home</a> &rsaquo; ${g ? `<a href="${collectionPath({ group: g.id })}">${t(g.label)}</a> &rsaquo; ` : ""}<span>${t(p.title)}</span>`;
  return wrap(
    `<nav aria-label="Breadcrumb">${crumbs}</nav><article><h1>${t(p.title)}</h1><p>${t(p.location)}</p><p><strong>${t(p.price_display)}</strong>${p.status && p.status !== "Available" ? ` (${t(p.status)})` : ""}</p>` +
    (img ? `<img src="${a(absUrl("", img))}" alt="${a(`${p.title} - ${p.location}`)}" width="1200" height="750">` : "") +
    `<h2>Property overview</h2><p>${t(p.description)}</p><h2>Specifications</h2><dl>${rows.map(([k, v]) => `<dt>${t(k)}</dt><dd>${t(v)}</dd>`).join("")}</dl>` +
    `<p><a href="${a(`${WA}?text=${encodeURIComponent(msg)}`)}">Enquire on WhatsApp</a> | <a href="${a(TEL)}">Call ${t(PHONE_PRETTY)}</a></p></article>`
  );
}

export function snapshotHtml(route, all, origin) {
  switch (route.type) {
    case "home": return home(all);
    case "collection": return collection(route, all);
    case "property": return property(route.p, origin);
    case "privacy": return wrap("<h1>Privacy Policy</h1><p>How SLR PROPERTIES collects and uses the information you share through its website and enquiry forms.</p>");
    case "terms": return wrap("<h1>Terms &amp; Conditions</h1><p>Terms and conditions for using the SLR PROPERTIES website, property listings and enquiry forms.</p>");
    case "notfound": return wrap("<h1>We could not find that page</h1><p>It may have been sold, rented or removed.</p><p><a href=\"/properties\">View available properties</a></p>");
    default: return "";
  }
}
