import Seo from "../components/Seo.jsx";
import { EMAIL, PHONE_PRETTY, TEL } from "../utils/contact.js";

const terms = [
  ["About these terms", "These Terms & Conditions apply to your use of the SLR PROPERTIES website. By browsing the site, saving properties or sending an enquiry, you agree to them. If you do not agree, please do not use the site."],
  ["Property information", "Listings, prices, areas, photos, videos and descriptions are provided in good faith and may change without notice. Images and videos are for illustration. Please confirm all details, including area, price, availability and approvals, with SLR PROPERTIES before making any decision."],
  ["No offer or guarantee", "Listings on this website are an invitation to enquire and do not form a binding offer or contract. A property may be sold, rented or withdrawn at any time. A sale or rental is final only after a written agreement is signed between the parties."],
  ["Verification and documents", "You are advised to verify title, approvals, tax receipts and all other legal documents independently, and to take professional legal advice, before paying any token or advance amount."],
  ["Prices, EMI and loan estimates", "The home loan calculator is indicative only. Actual interest rates, eligibility and charges are decided by your bank or lender, and SLR PROPERTIES is not responsible for them."],
  ["Enquiries and your information", "When you send an enquiry we collect the details you enter (name, phone, email and message) so that we can respond to you. We do not ask for payment through this website. Favorites are saved only in your own browser on your device."],
  ["Communication", "By submitting an enquiry you allow SLR PROPERTIES to contact you by phone, WhatsApp or email about your enquiry and relevant properties."],
  ["Use of the website", "You agree not to misuse the site, attempt to disrupt it, or copy, reproduce or resell its content, photos or branding without written permission from SLR PROPERTIES."],
  ["Limitation of liability", "To the extent permitted by law, SLR PROPERTIES is not liable for any loss arising from reliance on information shown on this website, or from interruption or errors in the website or third-party links such as WhatsApp or Instagram."],
  ["Changes to these terms", "We may update these terms from time to time. The version published on this page applies when you use the site."],
  ["Contact", null],
];

export default function Terms() {
  return (
    <section className="page" aria-labelledby="terms-h">
      <Seo title="Terms & Conditions" path="/terms" description="Terms and conditions for using the SLR PROPERTIES website, property listings and enquiry forms." />
      <div className="wrap narrow terms">
        <span className="eyebrow">Legal</span>
        <h1 id="terms-h" className="page-h">Terms &amp; Conditions</h1>
        {terms.map(([h, t], i) => (
          <section key={h}>
            <h2>{i + 1}. {h}</h2>
            {t ? <p>{t}</p> : <p>Questions about these terms? Call <a href={TEL}>{PHONE_PRETTY}</a> or email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>}
          </section>
        ))}
      </div>
    </section>
  );
}
