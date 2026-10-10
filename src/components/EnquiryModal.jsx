import { useEffect } from "react";
import ContactForm from "./ContactForm.jsx";

export default function EnquiryModal({ target, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const key = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", key);
    return () => { document.body.style.overflow = ""; removeEventListener("keydown", key); };
  }, [onClose]);

  return (
    <div className="modal show" role="dialog" aria-modal="true" aria-label="Enquiry form" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet sm">
        <button className="x" type="button" onClick={onClose} aria-label="Close"><i className="fa-solid fa-xmark" /></button>
        <span className="eyebrow">Send an enquiry</span>
        <h2 style={{ fontSize: "1.4rem", margin: ".35rem 0 1.2rem" }}>{target.title}</h2>
        <ContactForm target={target} idPrefix="m" />
      </div>
    </div>
  );
}
