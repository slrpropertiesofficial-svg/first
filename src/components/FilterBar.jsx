import { GROUPS, BUY_BUDGETS, RENT_BUDGETS } from "../utils/categories.js";
import { locationsOf } from "../utils/filters.js";
import { priceLabel } from "../utils/format.js";

// Advanced search: sale/rent, type, location, min/max budget, keyword, sort.
export default function FilterBar({ all, filters, setFilters }) {
  const g = GROUPS.find((x) => x.id === filters.group);
  const presets = (filters.deal === "rent" ? RENT_BUDGETS : BUY_BUDGETS).filter(([v]) => v);
  const rent = filters.deal === "rent";
  const bad = filters.min !== "" && filters.max !== "" && Number(filters.min) > Number(filters.max);

  return (
    <>
      <div className="chips" role="group" aria-label="Property category">
        <button className={`chip ${filters.group === "all" && !filters.saved ? "on" : ""}`} onClick={() => setFilters({ group: "all", sub: "all", saved: false })}>All</button>
        {GROUPS.map((x) => <button key={x.id} className={`chip ${filters.group === x.id && filters.sub === "all" ? "on" : ""}`} onClick={() => setFilters({ group: x.id, sub: "all", saved: false })}>{x.label}</button>)}
      </div>
      {g && (
        <div className="chips sub">
          {g.subs.map((s) => <button key={s} className={`chip ${filters.sub === s ? "on" : ""}`} onClick={() => setFilters({ sub: filters.sub === s ? "all" : s })}>{s}</button>)}
        </div>
      )}

      <div className="toolbar">
        <div className="seg" role="group" aria-label="Buy or rent">
          {[["all", "All"], ["buy", "Buy"], ["rent", "Rent"]].map(([v, l]) => (
            <button key={v} className={filters.deal === v ? "on" : ""} onClick={() => setFilters({ deal: v })}>{l}</button>
          ))}
        </div>
        <div className="field inline"><label htmlFor="lloc" className="sr">Location</label>
          <select id="lloc" value={filters.location} onChange={(e) => setFilters({ location: e.target.value })}>
            <option value="all">All locations</option>
            {locationsOf(all).map((l) => <option key={l} value={l}>{l}</option>)}
          </select></div>
        <div className="field inline"><label htmlFor="lq" className="sr">Search</label>
          <input id="lq" type="search" placeholder="Search keyword" value={filters.q} onChange={(e) => setFilters({ q: e.target.value })} /></div>
        <div className="field inline"><label htmlFor="lsort" className="sr">Sort</label>
          <select id="lsort" value={filters.sort} onChange={(e) => setFilters({ sort: e.target.value })}>
            <option value="featured">Featured first</option><option value="newest">Newest</option>
            <option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="area">Largest area</option>
          </select></div>
      </div>

      <div className="budget" role="group" aria-label="Budget">
        <span className="budget-l"><i className="fa-solid fa-indian-rupee-sign" /> Budget{rent ? " (per month)" : ""}</span>
        <div className="field inline"><label htmlFor="lmin" className="sr">Minimum budget in rupees</label>
          <input id="lmin" type="number" inputMode="numeric" min="0" step="1000" list="presets-min" placeholder="Min ₹" value={filters.min} onChange={(e) => setFilters({ min: e.target.value })} /></div>
        <span className="to">to</span>
        <div className="field inline"><label htmlFor="lmax" className="sr">Maximum budget in rupees</label>
          <input id="lmax" type="number" inputMode="numeric" min="0" step="1000" list="presets-max" placeholder="Max ₹" value={filters.max} onChange={(e) => setFilters({ max: e.target.value })} /></div>
        <datalist id="presets-min">{presets.map(([v, l]) => <option key={v} value={v} label={l} />)}</datalist>
        <datalist id="presets-max">{presets.map(([v, l]) => <option key={v} value={v} label={l} />)}</datalist>
        <small className="budget-h" aria-live="polite">
          {bad ? "Minimum is higher than maximum" : (filters.min || filters.max) ? `${filters.min ? priceLabel(filters.min, rent) : "Any"} – ${filters.max ? priceLabel(filters.max, rent) : "Any"}` : filters.deal === "all" ? "Pick Buy or Rent for a precise range" : ""}
        </small>
      </div>
    </>
  );
}
