import Accordion from "./Accordion.jsx";
import { FAQ } from "../utils/faq.js";

export default function Faq() {
  return (
    <section aria-labelledby="faq-h">
      <div className="wrap narrow">
        <div className="sec-head"><div><span className="eyebrow">Questions</span><h2 id="faq-h">Before you enquire</h2></div></div>
        <Accordion items={FAQ} />
      </div>
    </section>
  );
}
