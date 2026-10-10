import logo from "../assets/logo-full.png";
import Icon from "./Icon.jsx";

const cards = [
  ["building", "Homes, land & commercial", "Houses, apartments and villas; sites, agricultural land and layout plots; and shops, retail and office rentals."],
  ["user-tie", "Personal assistance", "A real person supports your search from shortlisting to site visits, by phone or WhatsApp."],
  ["video", "Photos & video walkthroughs", "Listings include photos and, when available, video walkthroughs to help you shortlist before you visit."],
  ["file-signature", "Documentation & registration guidance", "We help you understand which documents to review and guide you through the registration process."],
];

export default function Why() {
  return (
    <section id="about" aria-labelledby="about-h">
      <div className="wrap">
        <div className="sec-head center">
          <div><span className="eyebrow">About SLR Properties</span>
            <h2 id="about-h">A dependable partner for your property search</h2>
            <p className="lede">SLR PROPERTIES helps buyers, tenants and owners across residential, plots and land, and commercial rentals.</p></div>
        </div>
        <div className="trust-grid">
          {cards.map(([ic, h, t]) => (
            <article className="trust-card" key={h}>
              <span className="ic"><Icon name={ic} /></span>
              <h3>{h}</h3><p>{t}</p>
            </article>
          ))}
        </div>
        <div className="brand-band">
          <img loading="lazy" src={logo} alt="SLR Properties emblem" />
          <div><b>SLR PROPERTIES</b><p>"Securing Your Space in the Future."</p></div>
        </div>
      </div>
    </section>
  );
}
