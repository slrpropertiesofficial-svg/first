import { GROUPS, info } from "../utils/categories.js";

export default function Browse({ all, onPick }) {
  return (
    <section className="browse">
      <div className="wrap">
        <div className="sec-head"><div><span className="eyebrow">Browse by category</span><h2>Explore by category</h2></div></div>
        <div className="tiles">
          {GROUPS.map((g) => {
            const n = all.filter((p) => info(p.category).g?.id === g.id).length;
            return (
              <button key={g.id} className="tile" type="button" onClick={() => onPick(g.id)}>
                <img loading="lazy" src={g.img} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
                <i className={`fa-solid ${g.icon}`} />
                <div><h3>{g.label}</h3><small>{g.subs.join(" · ")}</small>{n > 0 && <span className="tile-n">{n} {n === 1 ? "listing" : "listings"}</span>}</div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
