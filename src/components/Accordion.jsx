import { useState } from "react";

// items: [[question, answer], ...]
export default function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq">
      {items.map(([q, a], i) => (
        <div key={q} className={`faq-i ${open === i ? "open" : ""}`}>
          <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>{q}<i className="fa-solid fa-plus" /></button>
          <div className="faq-a"><p>{a}</p></div>
        </div>
      ))}
    </div>
  );
}
