import { info, } from "../utils/categories.js";
import { isVideo, specsFor, propertyPath } from "../utils/property.js";
import { Link, navigate } from "../utils/router.jsx";
import Media from "./Media.jsx";
import Button from "./Button.jsx";
import WhatsAppButton from "./WhatsAppButton.jsx";

export default function Cards({ p, saved, toggleSaved, onEnquire }) {
  const off = p.status && p.status !== "Available";
  const path = propertyPath(p);
  return (
    <article className={`card ${off ? "off" : ""}`} onClick={(e) => { if (!e.target.closest("a,button")) navigate(path); }}>
      <div className="media">
        <Media u={p.image_url} />
        <div className="badges">
          <span className="badge">{info(p.category).sub}</span>
          {p.is_featured ? <span className="badge f"><i className="fa-solid fa-star" /> Featured</span> : null}
          {off && <span className="badge st">{p.status}</span>}
        </div>
        <button type="button" className={`heart ${saved ? "on" : ""}`} aria-pressed={saved} aria-label={saved ? "Remove from favorites" : "Save to favorites"}
          onClick={(e) => { e.stopPropagation(); toggleSaved(p.id); }}><i className="fa-solid fa-heart" /></button>
        {isVideo(p.image_url) && <span className="playb"><i className="fa-solid fa-play" /></span>}
        <div className="loc"><span><i className="fa-solid fa-location-dot" /> {p.location}</span>
          <h3><Link to={path} onClick={(e) => e.stopPropagation()}>{p.title}</Link></h3></div>
      </div>
      <div className="body">
        <p className="desc">{p.description}</p>
        <div className="specs">
          {specsFor(p).map((s) => <div key={s[2]}><b><i className={`fa-solid ${s[0]}`} />{s[1]}</b><small>{s[2]}</small></div>)}
        </div>
        <div className="foot">
          <div className="price"><small>Price</small><b>{p.price_display}</b></div>
          <div className="acts">
            <WhatsAppButton p={p} iconOnly />
            <Button disabled={off} onClick={() => onEnquire(p)}>{off ? p.status : "Enquire"}</Button>
          </div>
        </div>
      </div>
    </article>
  );
}
