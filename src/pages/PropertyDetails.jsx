import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { info, isRent } from "../utils/categories.js";
import { inr } from "../utils/format.js";
import { TEL, PHONE_PRETTY, mailLink } from "../utils/contact.js";
import { areaOf, gallery as galleryOf, highlightsOf, propertyPath } from "../utils/property.js";
import { Link } from "../utils/router.jsx";
import Seo from "../components/Seo.jsx";
import Gallery from "../components/Gallery.jsx";
import EmiCalculator from "../components/EmiCalculator.jsx";
import Cards from "../components/Cards.jsx";
import WhatsAppButton from "../components/WhatsAppButton.jsx";
import NotFound from "./NotFound.jsx";

export default function PropertyDetails({ id }) {
  const { all, state, saved, toggleSaved, setEnquiry } = useApp();
  const p = all.find((x) => x.id === id);
  const [copied, setCopied] = useState(false);

  const jsonLd = useMemo(() => p && ({
    "@context": "https://schema.org", "@type": "RealEstateListing", name: p.title, description: p.description,
    url: location.origin + propertyPath(p), image: galleryOf(p).filter((u) => !/\.(mp4|webm|mov)/i.test(u)).map((u) => (u.startsWith("/") ? location.origin + u : u)),
    offers: { "@type": "Offer", price: p.price, priceCurrency: "INR" },
    contentLocation: { "@type": "Place", name: p.location },
  }), [p]);

  if (state === "loading") return <section className="page"><div className="wrap"><div className="skel tall" /></div></section>;
  if (!p) return <NotFound what="property" />;

  const { g, sub } = info(p.category);
  const rent = isRent(p);
  const off = p.status && p.status !== "Available";
  const path = propertyPath(p);
  const hl = highlightsOf(p);
  const similar = all.filter((x) => x.id !== p.id && info(x.category).g?.id === g?.id).slice(0, 3);
  const isSaved = saved.includes(p.id);
  const imgs = galleryOf(p);

  const share = async () => {
    const url = location.origin + path;
    try {
      if (navigator.share) await navigator.share({ title: p.title, text: `${p.title} · ${p.price_display} · ${p.location}`, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* cancelled */ }
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
      <Seo title={`${p.title} - ${sub} in ${areaOf(p)}`} path={path} image={imgs.find((u) => !/\.(mp4|webm|mov)/i.test(u))}
        description={`${p.title}, ${p.location}. ${p.price_display}. ${p.description}`.slice(0, 158)} jsonLd={jsonLd} />
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link><i className="fa-solid fa-chevron-right" />
          <Link to="/#properties">Properties</Link><i className="fa-solid fa-chevron-right" />
          <span aria-current="page">{p.title}</span>
        </nav>

        <div className="d-grid">
          <div className="d-main">
            <Gallery p={p} />
            <header className="mhead">
              <div><span className="eyebrow"><i className="fa-solid fa-location-dot" /> {p.location}</span>
                <h1 className="page-h">{p.title}</h1>
                {off && <span className="badge st" style={{ marginTop: ".5rem", display: "inline-block" }}>{p.status}</span>}</div>
              <div className="mprice"><small>{rent ? "Rent" : "Price"}</small><b className="gold">{p.price_display}</b></div>
            </header>

            <h2 className="sub-h">Property overview</h2>
            <p className="overview">{p.description}</p>

            <h2 className="sub-h gap">Specifications</h2>
            <dl className="spec-table">{specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>

            {hl.length > 0 && (<>
              <h2 className="sub-h gap">Highlights</h2>
              <ul className="amen">{hl.map((a) => <li key={a.label}><i className={`fa-solid ${a.icon}`} />{a.label}</li>)}</ul>
            </>)}

            {!rent && p.price > 0 && <EmiCalculator price={p.price} />}
          </div>

          <aside className="d-side" aria-label="Contact options">
            <div className="side-card">
              <span className="eyebrow">Interested?</span>
              <h2>Talk to SLR Properties</h2>
              <div className="stack">
                <WhatsAppButton p={p} label="Enquire on WhatsApp" />
                <a className="btn ghost" href={TEL}><i className="fa-solid fa-phone" /> Call {PHONE_PRETTY}</a>
                <a className="btn ghost" href={mailLink(`Enquiry: ${p.title} (SLR-${p.id})`, `Hello SLR Properties,\n\nI am interested in "${p.title}" at ${p.location}.\n${location.origin}${path}\n`)}><i className="fa-solid fa-envelope" /> Email us</a>
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
