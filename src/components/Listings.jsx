import { WA } from "../utils/contact.js";
import { filterProperties } from "../utils/filters.js";
import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import ComingSoon from "./ComingSoon.jsx";
import FilterBar from "./FilterBar.jsx";
import Cards from "./Cards.jsx";

export default function Listings() {
  const { all, state, filters, applyFilters, resetFilters, saved, toggleSaved, setEnquiry } = useApp();
  const list = useMemo(() => filterProperties(all, filters, saved), [all, filters, saved]);
  const active = filters.q || filters.min || filters.max || filters.location !== "all" || filters.deal !== "all" || filters.group !== "all";

  return (
    <section id="properties" className="listings" aria-labelledby="listings-h">
      <div className="wrap">
        <div className="sec-head"><div><span className="eyebrow">Verified portfolio</span><h2 id="listings-h">Available real estate</h2></div></div>
        {state === "ready" && !all.length ? <ComingSoon /> : (<>
        <FilterBar all={all} filters={filters} setFilters={applyFilters} />

        <p className="count" aria-live="polite">
          {state === "ready" && `Showing ${list.length} of ${all.length} ${all.length === 1 ? "property" : "properties"}`}
          {active && state === "ready" && <button className="link" onClick={resetFilters}>Clear filters</button>}
        </p>

        <div className="grid">
          {state === "loading" && [0, 1, 2].map((i) => <div className="skel" key={i} />)}
          {state === "error" && (
            <div className="empty"><i className="fa-solid fa-circle-exclamation" /><h3>Listings could not be loaded</h3>
              <p>Refresh the page, or ask us directly on WhatsApp.</p>
              <a className="btn ghost" href={WA} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> Ask on WhatsApp</a></div>
          )}
          {state === "ready" && !list.length && (
            <div className="empty"><i className="fa-solid fa-building-circle-xmark" />
              <h3>Nothing matches these filters</h3>
              <p>Try a wider budget or another area, or ask us about upcoming listings.</p>
              <div className="cta-row center"><button className="btn" onClick={resetFilters}>Show all properties</button>
                <a className="btn ghost" href={WA} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> Ask on WhatsApp</a></div></div>
          )}
          {state === "ready" && list.map((p) => (
            <Cards key={p.id} p={p} saved={saved.includes(p.id)} toggleSaved={toggleSaved} onEnquire={setEnquiry} />
          ))}
        </div>
        </>)}
      </div>
    </section>
  );
}
