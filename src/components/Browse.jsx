import { GROUPS, info } from "../utils/categories.js";
import { Link } from "../utils/router.jsx";
import { collectionPath } from "../utils/routes.js";

export default function Browse({ all }) {
  return (
    <section className="browse">
      <div className="wrap">
        <div className="sec-head"><div><span className="eyebrow">Browse by category</span><h2>Explore by category</h2></div></div>
        <div className="tiles">
          {GROUPS.map((g) => {
            const n = all.filter((p) => info(p.category).g?.id === g.id).length;
            return (
              <Link key={g.id} className="tile" to={collectionPath({ group: g.id })}>
                <img loading="lazy" decoding="async" src={g.img} alt={g.label} width="900" height="600" onError={(e) => (e.currentTarget.style.display = "none")} />
                <i className={`fa-solid ${g.icon}`} />
                <div><h3>{g.label}</h3><small>{g.subs.join(" · ")}</small>{n > 0 && <span className="tile-n">{n} {n === 1 ? "listing" : "listings"}</span>}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
