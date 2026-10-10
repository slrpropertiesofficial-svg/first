import { useEffect, useState } from "react";
import { WA, CHANNEL, INSTAGRAM, PHONE_PRETTY, EMAIL, TEL } from "../utils/contact.js";

export default function FloatingContact() {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(false);
  useEffect(() => {
    const s = () => setTop(scrollY > 700);
    const c = (e) => !e.target.closest(".fab") && setOpen(false);
    addEventListener("scroll", s, { passive: true }); document.addEventListener("click", c);
    return () => { removeEventListener("scroll", s); document.removeEventListener("click", c); };
  }, []);
  const links = [
    ["s-wa", WA, "fa-brands fa-whatsapp", "WhatsApp"], ["s-ch", CHANNEL, "fa-solid fa-bullhorn", "Channel"],
    ["s-ig", INSTAGRAM, "fa-brands fa-instagram", "Instagram"], ["s-ph", TEL, "fa-solid fa-phone", "Call " + PHONE_PRETTY],
    ["s-ml", `mailto:${EMAIL}`, "fa-solid fa-envelope", "Email"],
  ];
  return (
    <>
      <button className={`to-top ${top ? "show" : ""}`} aria-label="Back to top" onClick={() => scrollTo({ top: 0, behavior: "smooth" })}><i className="fa-solid fa-arrow-up" /></button>
      <div className={`fab ${open ? "open" : ""}`}>
        <div className="fab-list">
          {links.map(([cls, href, icon, label], i) => (
            <a key={cls} className={cls} style={{ "--i": i }} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener" aria-label={label}><i className={icon} /><span>{label}</span></a>
          ))}
        </div>
        <button className="fab-btn" type="button" aria-expanded={open} aria-label="Contact links" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
          <i className={`fa-solid ${open ? "fa-xmark" : "fa-comments"}`} />
        </button>
      </div>
    </>
  );
}
