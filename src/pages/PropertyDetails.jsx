import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { info, isRent } from "../utils/categories.js";
import { inr } from "../utils/format.js";
import { TEL, PHONE_PRETTY, mailLink } from "../utils/contact.js";
import { collectionPath } from "../utils/routes.js";
import { metaFor } from "../utils/seo.js";
import { siteOrigin } from "../utils/boot.js";
import { areaOf, highlightsOf, propertyPath, slugify } from "../utils/property.js";
import { directionsUrl, embedUrl, hasPin, openMapUrl } from "../utils/geo.js";
import { Link } from "../utils/router.jsx";
import Seo from "../components/Seo.jsx";
import Gallery from "../components/Gallery.jsx";
import EmiCalculator from "../components/EmiCalculator.jsx";
import Cards from "../components/Cards.jsx";
import WhatsAppButton from "../components/WhatsAppButton.jsx";

export default function PropertyDetails({ p }) {
  const { all, saved, toggleSaved, setEnquiry } = useApp();
  const [copied, setCopied] = useState(false);
  const path = propertyPath(p);
  const meta = useMemo(() => metaFor({ type: "property", p, path }, all, siteOrigin()), [p, path, all]);

  const { g, sub } = info(p.category);
  const rent = isRent(p);
  const off = p.status && p.status !== "Available";
  const hl = highlightsOf(p);
  const similar = all.filter((x) => x.id !== p.id && info(x.category).g?.id === g?.id).slice(0, 3);
  const isSaved = saved.includes(p.id);

  const share = async () => {
    const url = siteOrigin() + path;
    try {
      if (navigator.share) await navigator.share({ title: p.title, text: `${p.title} · ${p.price_display} · ${p.location}`, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { }
  };

  const specs = [
    ["Type", sub], ["Listing for", rent ? "Rent" : "Sale"], ["Location", p.location],
    ...(g?.id === "residential" ? [["Bedrooms", p.beds], ["Bathrooms", p.baths]] : []),
    ...(g?.id === "commercial" && p.baths ? [["Restrooms", p.baths]] : []),
    ["Total area", `${Number(p.sqft || 0).toLocaleString("en-IN")} Sq.Ft`],
    ...(!rent && p.sqft > 0 ? [["Approx. per Sq.Ft", inr(p.price / p.sqft)]] : []),
    ["Status", p.status || "Available"], ["Listing ref", `SLR-${p.id}`],
  ];

  return (
    <article className="page detail">
      <Seo meta={meta} />
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link><i className="fa-solid fa-chevron-right" />
          <Link to={collectionPath({ group: g?.id })}>{g?.label || "Properties"}</Link><i className="fa-solid fa-chevron-right" />
          <span aria-current="page">{p.title}</span>
        </nav>

        <div className="d-grid">
          <div className="d-main">
            <Gallery p={p} />
            <header className="mhead">
              <div><span className="eyebrow"><i className="fa-solid fa-location-dot" /> {p.location}</span>
                <h1 className="page-h">{p.title}</h1>
                {off && <span className="badge st" style={{ marginTop: ".5rem", display: "inline-block" }}>{p.status}</span>}</div>
              <div className="mprice"><small>{rent ? "Rent" : "Price"}</small><b>{p.price_display}</b></div>
            </header>

            <h2 className="sub-h">Property overview</h2>
            <p className="overview">{p.description}</p>

            <h2 className="sub-h gap">Specifications</h2>
            <dl className="spec-table">{specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>

            {hl.length > 0 && (<>
              <h2 className="sub-h gap">Highlights</h2>
              <ul className="amen">{hl.map((a) => <li key={a.label}><i className={`fa-solid ${a.icon}`} />{a.label}</li>)}</ul>
            </>)}

            <h2 className="sub-h gap">Location</h2>
            <div className="loc-map">
              <iframe title={`Map of ${p.title}`} src={embedUrl(p)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
            <div className="loc-acts">
              <a className="btn" href={directionsUrl(p)} target="_blank" rel="noopener"><i className="fa-solid fa-diamond-turn-right" /> Get directions</a>
              <a className="btn ghost" href={openMapUrl(p)} target="_blank" rel="noopener"><i className="fa-solid fa-map-location-dot" /> Open in Google Maps</a>
            </div>
            {!hasPin(p) && <p className="loc-note">Map shows the approximate area. Ask us for the exact site location.</p>}

            {!rent && p.price > 0 && <EmiCalculator price={p.price} />}
          </div>

          <aside className="d-side" aria-label="Contact options">
            <div className="side-card">
              <span className="eyebrow">Interested?</span>
              <h2>Talk to SLR Properties</h2>
              <div className="stack">
                <WhatsAppButton p={p} label="Enquire on WhatsApp" />
                <a className="btn ghost" href={TEL}><i className="fa-solid fa-phone" /> Call {PHONE_PRETTY}</a>
                <a className="btn ghost" href={mailLink(`Enquiry: ${p.title} (SLR-${p.id})`, `Hello SLR Properties,\n\nI am interested in "${p.title}" at ${p.location}.\n${siteOrigin()}${path}\n`)}><i className="fa-solid fa-envelope" /> Email us</a>
                <button className="btn ghost" type="button" disabled={off} onClick={() => setEnquiry(p)}><i className="fa-solid fa-paper-plane" /> {off ? p.status : "Send enquiry form"}</button>
              </div>
              <div className="side-acts">
                <button type="button" className={`icon-btn wide ${isSaved ? "on" : ""}`} aria-pressed={isSaved} onClick={() => toggleSaved(p.id)}><i className="fa-solid fa-heart" /> {isSaved ? "Saved" : "Save"}</button>
                <button type="button" className="icon-btn wide" onClick={share}><i className="fa-solid fa-share-nodes" /> {copied ? "Link copied" : "Share"}</button>
              </div>
              <p className="ref"><i className="fa-solid fa-shield-halved" /> Listing #SLR-{p.id}</p>
            </div>
          </aside>
        </div>

        <nav className="coll-links" aria-label="Related searches">
          <h2 className="sub-h">Explore more</h2>
          <div className="chips">
            {g && g.subs.includes(sub) && <Link className="chip" to={collectionPath({ group: g.id, sub })}>More {sub.toLowerCase()}</Link>}
            {g && <Link className="chip" to={collectionPath({ group: g.id })}>All {g.label.toLowerCase()}</Link>}
            {areaOf(p) && slugify(areaOf(p)) && <Link className="chip" to={collectionPath({ area: areaOf(p) })}>Properties in {areaOf(p)}</Link>}
          </div>
        </nav>

        {similar.length > 0 && (
          <section className="similar" aria-labelledby="sim-h">
            <h2 id="sim-h" className="sub-h">Similar properties</h2>
            <div className="grid">{similar.map((s) => <Cards key={s.id} p={s} saved={saved.includes(s.id)} toggleSaved={toggleSaved} onEnquire={setEnquiry} />)}</div>
          </section>
        )}
      </div>
    </article>
  );
}
