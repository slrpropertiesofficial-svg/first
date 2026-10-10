import Button from "./Button.jsx";
import { CHANNEL, WA } from "../utils/contact.js";

export default function CtaBanner() {
  return (
    <div className="cta-row">
      <Button variant="wa" brand icon="whatsapp" href={WA}> Chat on WhatsApp</Button>
      <Button variant="ghost" icon="bullhorn" href={CHANNEL}> Join WhatsApp channel</Button>
    </div>
  );
}
