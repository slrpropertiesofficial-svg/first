export const GROUPS = [
  { id: "residential", label: "Residential", icon: "fa-house", subs: ["Houses", "Apartments", "Villas"], legacy: { House: "Houses" },
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=70" },
  { id: "land", label: "Plots & Land", icon: "fa-map-location-dot", subs: ["Sites", "Agricultural Land", "Layout Plots"], legacy: { Land: "Land", "Sites & Plots": "Sites" },
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=70" },
  { id: "commercial", label: "Commercial Rentals", icon: "fa-store", subs: ["Shops", "Retail", "Offices"], legacy: { "Rental Shops": "Shops" },
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=70" },
];

// Works with both the new category names and the legacy ones from the first version.
export function info(cat) {
  for (const g of GROUPS) {
    if (g.subs.includes(cat)) return { g, sub: cat };
    if (g.legacy[cat]) return { g, sub: g.legacy[cat] };
  }
  return { g: null, sub: cat };
}

export const isRent = (p) => info(p.category).g?.id === "commercial" || /\/\s*mo/i.test(p.price_display || "");
export const BUY_BUDGETS = [["", "Any budget"], ["5000000", "Up to ₹50 Lakhs"], ["10000000", "Up to ₹1 Crore"], ["30000000", "Up to ₹3 Crores"], ["100000000", "Up to ₹10 Crores"]];
export const RENT_BUDGETS = [["", "Any budget"], ["50000", "Up to ₹50,000 / month"], ["100000", "Up to ₹1 Lakh / month"], ["200000", "Up to ₹2 Lakhs / month"], ["500000", "Up to ₹5 Lakhs / month"]];
