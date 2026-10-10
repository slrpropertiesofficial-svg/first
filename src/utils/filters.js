import { info, isRent } from "./categories.js";
import { areaOf } from "./property.js";

export const DEFAULT_FILTERS = { group: "all", sub: "all", q: "", location: "all", deal: "all", min: "", max: "", sort: "featured", saved: false };

export function filterProperties(all, f, saved = []) {
  const q = f.q.trim().toLowerCase();
  const min = f.min !== "" ? Number(f.min) : null;
  const max = f.max !== "" ? Number(f.max) : null;
  const out = all.filter((p) => {
    const { g, sub } = info(p.category);
    if (f.group !== "all" && g?.id !== f.group) return false;
    if (f.sub !== "all" && sub !== f.sub) return false;
    if (f.deal === "buy" && isRent(p)) return false;
    if (f.deal === "rent" && !isRent(p)) return false;
    if (f.location !== "all" && areaOf(p) !== f.location) return false;
    if (q && !`${p.title} ${p.location} ${p.description}`.toLowerCase().includes(q)) return false;
    if (min !== null && p.price < min) return false;
    if (max !== null && p.price > max) return false;
    if (f.saved && !saved.includes(p.id)) return false;
    return true;
  });
  const sorters = {
    featured: (a, b) => b.is_featured - a.is_featured || b.id - a.id,
    newest: (a, b) => b.id - a.id,
    low: (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
    area: (a, b) => b.sqft - a.sqft,
  };
  return out.sort(sorters[f.sort] || sorters.featured);
}

export const locationsOf = (all) => [...new Set(all.map(areaOf).filter(Boolean))].sort((a, b) => a.localeCompare(b));
