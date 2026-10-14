import { GROUPS } from "../utils/categories.js";
import { EMAIL, INSTAGRAM, PHONE_PRETTY, TEL, WA } from "../utils/contact.js";
import { Link } from "../utils/router.jsx";
import { collectionPath } from "../utils/routes.js";
import Icon from "./Icon.jsx";
import logo from "../assets/logo-full.webp";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div><img src={logo} alt="SLR Properties" width="150" height="97" loading="lazy" decoding="async" /><p className="fbrand">SLR PROPERTIES</p><p className="fq">"Securing Your Space in the Future."</p>
            <div className="social">
              <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="SLR Properties on Instagram"><Icon brand name="instagram" /></a>
              <a href={WA} target="_blank" rel="noopener noreferrer" aria-label="Chat with SLR Properties on WhatsApp"><Icon brand name="whatsapp" /></a>
              <a href={`mailto:${EMAIL}`} aria-label="Email SLR Properties"><Icon name="envelope" /></a>
            </div></div>
          <div><h2 className="fh">Explore</h2><Link to="/">Home</Link>
            {GROUPS.map((g) => <Link key={g.id} to={collectionPath({ group: g.id })}>{g.label}</Link>)}
            <Link to="/properties">All properties</Link>
            <Link to="/#process">How It Works</Link><Link to="/favorites">Favorites</Link></div>
          <div><h2 className="fh">Contact</h2><a href={TEL}>{PHONE_PRETTY}</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a href={WA} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">@slrproperties.official</a></div>
          <div><h2 className="fh">Legal</h2><Link to="/terms">Terms &amp; Conditions</Link><Link to="/privacy">Privacy Policy</Link><a href="/admin">Owner login</a></div>
        </div>
        <p className="copy">&copy; {new Date().getFullYear()} SLR PROPERTIES. All rights reserved.</p>
      </div>
    </footer>
  );
}
