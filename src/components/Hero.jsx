import { useState } from "react";
import { GROUPS, info } from "../utils/categories.js";
import Button from "./Button.jsx";
import { WA } from "../utils/contact.js";
import { HERO } from "../utils/site.js";

export default function Hero({ all, onSearch }) {
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [deal, setDeal] = useState("all");

  const submit = (e) => {
    e.preventDefault();
    const patch = { group: "all", sub: "all", q, deal, location: "all", min: "", max: "", saved: false };
    if (type.startsWith("g:")) patch.group = type.slice(2);
    if (type.startsWith("s:")) {
      const s = type.slice(2);
      patch.group = GROUPS.find((g) => g.subs.includes(s)).id; patch.sub = s;
    }
    onSearch(patch);
  };

  const counts = GROUPS.map((g) => ({ ...g, n: all.filter((p) => info(p.category).g?.id === g.id).length })).filter((c) => c.n > 0);

  return (
    <div className="hero">
      <img className="hero-bg" src={HERO.src} srcSet={HERO.srcSet} sizes={HERO.sizes} alt={HERO.alt} width="2000" height="1333" fetchpriority="high" decoding="async" />
      <div className="wrap hero-in">
        <h1>Find Your Perfect Property in Bangalore</h1>
        <p className="slogan">Securing Your Space in the Future.</p>
        <p className="lead">Houses, apartments, villas, sites, agricultural land and commercial rental properties, with personal assistance at every step.</p>

        <form className="search" onSubmit={submit} autoComplete="off" aria-label="Property search">
          <div className="field"><label htmlFor="fType">Property type</label>
            <select id="fType" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All types</option>
              {GROUPS.map((g) => (
                <optgroup key={g.id} label={g.label}>
                  <option value={`g:${g.id}`}>All {g.label}</option>
                  {g.subs.map((s) => <option key={s} value={`s:${s}`}>{s}</option>)}
                </optgroup>
              ))}
            </select></div>
          <div className="field"><label htmlFor="fDeal">Buy or rent</label>
            <select id="fDeal" value={deal} onChange={(e) => setDeal(e.target.value)}>
              <option value="all">Buy or rent</option><option value="buy">Buy</option><option value="rent">Rent</option>
            </select></div>
          <div className="field"><label htmlFor="fQuery">Keyword</label>
            <input id="fQuery" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. corner plot" /></div>
          <button className="btn" type="submit"><i className="fa-solid fa-magnifying-glass" /> Search</button>
        </form>

        <div className="hero-cta">
          <Button variant="wa" brand icon="whatsapp" href={WA}> Chat on WhatsApp</Button>
          <Button variant="ghost" icon="envelope" to="/#contact"> Send an enquiry</Button>
        </div>

        {counts.length > 0 && (
          <dl className="hero-stats">
            <div><dt>Live listings</dt><dd>{all.length}</dd></div>
            {counts.map((c) => <div key={c.id}><dt>{c.label}</dt><dd>{c.n}</dd></div>)}
          </dl>
        )}
      </div>
    </div>
  );
}
