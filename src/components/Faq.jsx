import Accordion from "./Accordion.jsx";

const qa = [
  ["Are properties checked before being listed?", "We review the details and documents shared with us before a property is listed. Documents and approvals differ for every property, so ask us what is available for the one you like, and we will help you review it. We recommend consulting a qualified property lawyer before any payment."],
  ["Can I visit a property before deciding?", "Yes. Send an enquiry from the listing or message us on WhatsApp, and we will arrange a site visit at a time that suits you."],
  ["Do you help with bank loans?", "We can guide you on the general process and the documents banks usually ask for. Loan approval, interest rates and eligibility are decided by your bank or lender. The EMI estimator on sale listings is indicative only."],
  ["How can I list my property with SLR Properties?", "Contact us on WhatsApp, phone or through the enquiry form with the property type, location, size and a few photos. Our team will get back to you on the next steps."],
  ["What information should I provide when enquiring?", "Your name, phone number and email, the type of property you want, your preferred location and budget, and whether you plan to buy or rent. The more detail you share, the better we can shortlist."],
];

export default function Faq() {
  return (
    <section aria-labelledby="faq-h">
      <div className="wrap narrow">
        <div className="sec-head"><div><span className="eyebrow">Questions</span><h2 id="faq-h">Before you enquire</h2></div></div>
        <Accordion items={qa} />
      </div>
    </section>
  );
}
