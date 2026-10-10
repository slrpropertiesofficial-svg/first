import Button from "./Button.jsx";
import Icon from "./Icon.jsx";
import { waLink } from "../utils/contact.js";
import { waEnquiryText } from "../utils/property.js";

// Opens WhatsApp with a message already naming the property.
export default function WhatsAppButton({ p, label = "WhatsApp", iconOnly = false }) {
  const href = waLink(waEnquiryText(p));
  const aria = `Enquire about ${p.title} on WhatsApp`;
  if (iconOnly) return <a className="icon-btn wa-icon" href={href} target="_blank" rel="noopener noreferrer" aria-label={aria} onClick={(e) => e.stopPropagation()}><Icon brand name="whatsapp" /></a>;
  return <Button variant="wa" brand icon="whatsapp" href={href} aria-label={aria}> {label}</Button>;
}
