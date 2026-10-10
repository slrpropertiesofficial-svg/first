import Button from "./Button.jsx";
import Icon from "./Icon.jsx";
import { WA, TEL, PHONE_PRETTY } from "../utils/contact.js";

// Shown when the property database has no listings yet.
export default function ComingSoon() {
  return (
    <div className="soon">
      <span className="soon-ic"><Icon name="building" /></span>
      <h3>New properties coming soon</h3>
      <p>We are preparing our latest listings. Tell us what you are looking for and we will contact you about available houses, plots and commercial rentals.</p>
      <div className="cta-row center">
        <Button variant="wa" brand icon="whatsapp" href={WA}> Ask on WhatsApp</Button>
        <Button variant="ghost" icon="phone" href={TEL}> Call {PHONE_PRETTY}</Button>
      </div>
    </div>
  );
}
