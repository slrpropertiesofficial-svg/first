import Seo from "../components/Seo.jsx";
import { metaFor } from "../utils/seo.js";
import { siteOrigin } from "../utils/boot.js";
import { EMAIL, PHONE_PRETTY, TEL } from "../utils/contact.js";

const items = [
  ["Information we collect", "When you send an enquiry we collect the details you enter: your name, phone number, email address, enquiry type and message. We do not ask for payment details or documents through this website."],
  ["How we use it", "We use your details only to respond to your enquiry, share relevant property information and arrange visits. We do not sell your personal information."],
  ["Storage and access", "Enquiries are saved in the website's database and are visible to the SLR PROPERTIES team through the owner dashboard."],
  ["Favorites", "Properties you save as favorites are stored in your own browser (local storage) on your device. They are not sent to us."],
  ["Third-party services", "Links such as WhatsApp and Instagram open third-party services with their own privacy policies. The website also loads fonts, icons and some images from third-party providers, which may receive your IP address when the page loads."],
  ["Your choices", "You can ask us to correct or delete the details you shared in an enquiry by contacting us."],
  ["Changes", "We may update this policy from time to time. The version on this page applies when you use the site."],
  ["Contact", null],
];

export default function Privacy() {
  return (
    <section className="page" aria-labelledby="priv-h">
      <Seo meta={metaFor({ type: "privacy", path: "/privacy" }, [], siteOrigin())} />
      <div className="wrap narrow terms">
        <span className="eyebrow">Legal</span>
        <h1 id="priv-h" className="page-h">Privacy Policy</h1>
        {items.map(([h, t], i) => (
          <section key={h}><h2>{i + 1}. {h}</h2>
            {t ? <p>{t}</p> : <p>Privacy questions? Call <a href={TEL}>{PHONE_PRETTY}</a> or email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>}</section>
        ))}
      </div>
    </section>
  );
}
