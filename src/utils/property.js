import { info } from "./categories.js";

export const isVideo = (u) => /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(u || "");
export const safeUrl = (u) => (/^(\/(?!\/)|https?:\/\/)/i.test(u || "") ? u : "");

export function gallery(p) {
  let extra = [];
  try { extra = JSON.parse(p.images_json || "[]"); } catch { /* ignore */ }
  return [p.image_url, ...extra].map(safeUrl).filter(Boolean);
}

export function specsFor(p) {
  const g = info(p.category).g?.id;
  const area = Number(p.sqft || 0).toLocaleString("en-IN");
  if (g === "residential") return [["fa-bed", p.beds, "Bedrooms"], ["fa-bath", p.baths, "Baths"], ["fa-ruler-combined", area, "Sq.Ft"]];
  if (g === "commercial") return [["fa-store", "Retail", "Commercial"], ["fa-restroom", p.baths || 1, "Restroom"], ["fa-ruler-combined", area, "Sq.Ft"]];
  return [["fa-vector-square", "Clear Title", "Status"], ["fa-file-shield", "Verified", "Legal"], ["fa-ruler-combined", area, "Area Sq.Ft"]];
}

// Area = first part of "Whitefield, Bangalore".
export const areaOf = (p) => String(p.location || "").split(",")[0].trim();

export const slugify = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
export const propertyPath = (p) => `/property/${slugify(p.title)}-${p.id}`;
export const idFromSlug = (s) => { const m = String(s || "").match(/(\d+)$/); return m ? Number(m[1]) : null; };

// Highlights are only picked out of the listing's own description - nothing is invented.
const HIGHLIGHTS = [
  [/car parking|covered car|parking/i, "Car parking", "fa-car"],
  [/solar/i, "Solar water heating", "fa-sun"],
  [/garden/i, "Private garden", "fa-seedling"],
  [/modern kitchen/i, "Modern kitchen", "fa-kitchen-set"],
  [/gated community|gated/i, "Gated community", "fa-torii-gate"],
  [/clubhouse/i, "Clubhouse access", "fa-people-roof"],
  [/security/i, "Security", "fa-shield-halved"],
  [/underground cabling/i, "Underground cabling", "fa-bolt"],
  [/tar roads?|wide .*roads?/i, "Wide tar roads", "fa-road"],
  [/clear[- ]title|clear legal/i, "Clear title / legal documents", "fa-file-shield"],
  [/BDA approved/i, "BDA approved", "fa-stamp"],
  [/bank loan/i, "Bank loan approvals", "fa-building-columns"],
  [/elevator/i, "Private elevator", "fa-elevator"],
  [/home theatre/i, "Home theatre", "fa-film"],
  [/terrace/i, "Terrace lounge", "fa-umbrella-beach"],
  [/servant quarters/i, "Servant quarters", "fa-house-user"],
  [/corner/i, "Corner property", "fa-vector-square"],
  [/facing/i, "Facing: see description", "fa-compass"],
  [/glass frontage/i, "Glass frontage", "fa-store"],
  [/3-phase/i, "3-phase commercial power", "fa-plug"],
  [/HVAC/i, "HVAC points", "fa-fan"],
  [/highway/i, "Highway facing", "fa-road"],
];
export const highlightsOf = (p) =>
  HIGHLIGHTS.filter(([re]) => re.test(`${p.description || ""}`)).map(([, label, icon]) => ({ label, icon }));

export function waEnquiryText(p) {
  const url = `${location.origin}${propertyPath(p)}`;
  return `Hello SLR Properties, I would like to enquire about "${p.title}" (${p.location}, ${p.price_display}) - Listing #SLR-${p.id}.\n${url}`;
}
