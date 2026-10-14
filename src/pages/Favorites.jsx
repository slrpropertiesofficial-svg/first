import { useApp } from "../context/AppContext.jsx";
import { Link } from "../utils/router.jsx";
import Seo from "../components/Seo.jsx";
import { metaFor } from "../utils/seo.js";

const META = metaFor({ type: "favorites", path: "/favorites" }, [], "");
import Cards from "../components/Cards.jsx";

export default function Favorites() {
  const { all, state, saved, toggleSaved, setEnquiry } = useApp();
  const list = all.filter((p) => saved.includes(p.id));
  return (
    <section className="page" aria-labelledby="fav-h">
      <Seo meta={META} />
      <div className="wrap">
        <div className="sec-head"><div><span className="eyebrow">Saved on this device</span><h1 id="fav-h" className="page-h">Favorite properties</h1></div>
          <Link className="btn ghost" to="/#properties">Browse more</Link></div>
        <div className="grid">
          {state === "loading" && [0, 1, 2].map((i) => <div className="skel" key={i} />)}
          {state === "ready" && !list.length && (
            <div className="empty"><i className="fa-regular fa-heart" /><h2>No favorites yet</h2>
              <p>Tap the heart on any listing to save it here.</p>
              <Link className="btn" to="/#properties">View properties</Link></div>
          )}
          {list.map((p) => <Cards key={p.id} p={p} saved toggleSaved={toggleSaved} onEnquire={setEnquiry} />)}
        </div>
      </div>
    </section>
  );
}
