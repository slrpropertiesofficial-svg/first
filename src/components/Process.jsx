const steps = [
  ["Tell us what you need", "Share your budget, preferred location and property type."],
  ["Shortlist & site visit", "We shortlist suitable options and arrange a site visit."],
  ["Review documents", "Review the property documents and relevant approvals together."],
  ["Agreement & registration", "Proceed with the agreement and registration, with appropriate assistance."],
];

export default function Process() {
  return (
    <section id="process" className="alt" aria-labelledby="process-h">
      <div className="wrap">
        <div className="sec-head center"><div><span className="eyebrow">How it works</span><h2 id="process-h">Four steps from enquiry to registration</h2></div></div>
        <ol className="timeline">
          {steps.map(([h, t], i) => <li key={h}><span className="n">{i + 1}</span><h3>{h}</h3><p>{t}</p></li>)}
        </ol>
        <p className="fine">SLR Properties provides guidance and assistance. It does not replace advice from a qualified property lawyer, and the outcome of any transaction cannot be guaranteed.</p>
      </div>
    </section>
  );
}
