import { useEffect, useState } from "react";
import { GROUPS } from "../utils/categories.js";
import { WA } from "../utils/contact.js";
import logo from "../assets/logo-mark.png";
import { Link } from "../utils/router.jsx";

export default function Header({ onPick, savedCount }) {
  const [menu, setMenu] = useState(false);
  const [dd, setDd] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const onKey = (e) => e.key === "Escape" && (setMenu(false), setDd(null));
    const onClick = (e) => !e.target.closest("#nav") && (setMenu(false), setDd(null));
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => { removeEventListener("scroll", onScroll); removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, []);

  const pick = (g, s) => { onPick(g, s); setMenu(false); setDd(null); };

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`} id="nav">
      <Link className="logo" to="/" aria-label="SLR Properties home"><img src={logo} alt="SLR Properties" />
        <span className="brand-t"><b>SLR PROPERTIES</b><small>Securing Your Space in the Future.</small></span></Link>
      <button className="burger" type="button" aria-label="Toggle menu" aria-expanded={menu} onClick={() => setMenu(!menu)}><i /></button>
      <ul className={`menu ${menu ? "open" : ""}`}>
        <li><Link to="/" onClick={() => setMenu(false)}>Home</Link></li>
        {GROUPS.map((g) => (
          <li key={g.id} className={`dd ${dd === g.id ? "open" : ""}`}>
            <button type="button" aria-expanded={dd === g.id} onClick={(e) => { e.stopPropagation(); setDd(dd === g.id ? null : g.id); }}>{g.label}</button>
            <ul>
              <li><button type="button" onClick={() => pick(g.id)}>All {g.label}</button></li>
              {g.subs.map((s) => <li key={s}><button type="button" onClick={() => pick(g.id, s)}>{s}</button></li>)}
            </ul>
          </li>
        ))}
        <li><Link to="/#process" onClick={() => setMenu(false)}>How It Works</Link></li>
        <li><Link to="/#contact" onClick={() => setMenu(false)}>Contact</Link></li>
        <li>
          <Link to="/favorites" className="saved-link" onClick={() => setMenu(false)}>
            <i className="fa-solid fa-heart" /> Favorites{savedCount > 0 && <span className="dot">{savedCount}</span>}
          </Link>
        </li>
        <li><a className="wa" href={WA} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> WhatsApp Us</a></li>
      </ul>
    </nav>
  );
}
