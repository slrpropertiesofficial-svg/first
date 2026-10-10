import CtaBanner from "./CtaBanner.jsx";
import { WA, INSTAGRAM, PHONE_PRETTY, EMAIL, TEL } from "../utils/contact.js";
import ContactForm from "./ContactForm.jsx";

const cards = [
  ["fa-brands fa-whatsapp", "WhatsApp", PHONE_PRETTY, WA], ["fa-solid fa-phone", "Call", PHONE_PRETTY, TEL],
  ["fa-solid fa-envelope", "Email", EMAIL, `mailto:${EMAIL}`], ["fa-brands fa-instagram", "Instagram", "@slrproperties.official", INSTAGRAM],
];

export default function ContactSection() {
  return (
    <section id="contact" className="alt" aria-labelledby="contact-h">
      <div className="wrap">
        <div className="sec-head"><div><span className="eyebrow">Get in touch</span><h2 id="contact-h">Contact us</h2></div></div>
        <div className="contact-split">
          <div>
            <div className="contact-grid">
              {cards.map(([ic, b, s, href]) => (
                <a className="cc" key={b} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener"><i className={ic} /><b>{b}</b><span>{s}</span></a>
              ))}
            </div>
            <CtaBanner />
          </div>
          <div className="enq-box">
            <h3>Send an enquiry</h3>
            <ContactForm target={{ id: null, title: "General Inquiry" }} idPrefix="g" showType placeholder="Tell us what you are looking for…" />
          </div>
        </div>
      </div>
    </section>
  );
}
