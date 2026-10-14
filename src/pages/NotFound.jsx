import { Link } from "../utils/router.jsx";
import Seo from "../components/Seo.jsx";
import { metaFor } from "../utils/seo.js";

const META = metaFor({ type: "notfound", path: "/" }, [], "");

export default function NotFound({ what = "page" }) {
  return (
    <section className="page" aria-labelledby="nf-h">
      <Seo meta={{ ...META, path: location.pathname }} />
      <div className="wrap"><div className="empty"><i className="fa-solid fa-compass" />
        <h1 id="nf-h" className="page-h sm">We could not find that {what}</h1>
        <p>It may have been sold, rented or removed.</p>
        <Link className="btn" to="/#properties">View available properties</Link></div></div>
    </section>
  );
}
