import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { GROUPS } from "../utils/categories.js";
import { collectionInfo, collectionPath } from "../utils/routes.js";
import { locationsOf } from "../utils/filters.js";
import { metaFor } from "../utils/seo.js";
import { siteOrigin } from "../utils/boot.js";
import { Link } from "../utils/router.jsx";
import Seo from "../components/Seo.jsx";
import Cards from "../components/Cards.jsx";
import ComingSoon from "../components/ComingSoon.jsx";

export default function Collection({ route }) {
  const { all, saved, toggleSaved, setEnquiry } = useApp();
  const c = useMemo(() => collectionInfo(route, all), [route, all]);
  const meta = useMemo(() => metaFor(route, all, siteOrigin()), [route, all]);
  const areas = useMemo(() => locationsOf(all), [all]);
  const last = c.crumbs.length - 1;

  return (
    <section className="page" aria-labelledby="coll-h">
      <Seo meta={meta} />
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          {c.crumbs.map(([label, to], i) => (
            <span key={to} style={{ display: "contents" }}>
              {i === last ? <span aria-current="page">{label}</span> : <Link to={to}>{label}</Link>}
              {i < last && <i className="fa-solid fa-chevron-right" aria-hidden="true" />}
            </span>
          ))}
        </nav>

        <div className="sec-head">
          <div>
            <span className="eyebrow">{SITE_EYEBROW}</span>
            <h1 id="coll-h" className="page-h">{c.h1}</h1>
            <p className="coll-intro">{c.intro}</p>
          </div>
        </div>

        <div className="chips" role="group" aria-label="Property category">
          <Link className={`chip ${!c.group && !c.area ? "on" : ""}`} to="/properties">All</Link>
          {GROUPS.map((g) => <Link key={g.id} className={`chip ${c.group?.id === g.id && !c.sub ? "on" : ""}`} to={collectionPath({ group: g.id })}>{g.label}</Link>)}
        </div>
        {c.group && (
          <div className="chips sub">
            {c.group.subs.map((s) => <Link key={s} className={`chip ${c.sub === s ? "on" : ""}`} to={collectionPath({ group: c.group.id, sub: s })}>{s}</Link>)}
          </div>
        )}

        <div className="grid" style={{ marginTop: "1.6rem" }}>
          {c.list.map((p) => <Cards key={p.id} p={p} saved={saved.includes(p.id)} toggleSaved={toggleSaved} onEnquire={setEnquiry} />)}
        </div>
        {!c.list.length && <ComingSoon />}

        {areas.length > 1 && (
          <div className="coll-links">
            <h2>Browse by area</h2>
            <div className="chips">
              {areas.map((a) => <Link key={a} className={`chip ${c.area === a ? "on" : ""}`} to={collectionPath({ area: a })}>{a}</Link>)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const SITE_EYEBROW = "Property listings";
