import { useState } from "react";
import { api } from "../utils/api.js";
import Button from "./Button.jsx";
import { Link } from "../utils/router.jsx";
import { WA, EMAIL, PHONE_PRETTY, TEL, mailLink } from "../utils/contact.js";

const TYPES = ["Buy a residential property", "Buy plots or land", "Rent a commercial space", "List my property", "Something else"];

const validators = {
  name: (v) => (v.trim().length < 2 ? "Please enter your full name." : ""),
  phone: (v) => { const d = v.replace(/\D/g, ""); return d.length < 10 || d.length > 15 ? "Enter a valid phone number (10 to 15 digits)." : ""; },
  email: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "Enter a valid email address, e.g. name@example.com." : ""),
};

// Posts to the existing /api/inquiries endpoint. Success is shown only when the API confirms it.
export default function ContactForm({ target, idPrefix = "c", showType = false, placeholder = "I would like to visit this property…" }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", type: "", msg: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | error | sent
  const [err, setErr] = useState("");
  const [waUrl, setWaUrl] = useState(WA);

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: "" }); };
  const blur = (k) => () => validators[k] && setErrors((x) => ({ ...x, [k]: validators[k](form[k]) }));
  const check = () => {
    const e = { name: validators.name(form.name), phone: validators.phone(form.phone), email: validators.email(form.email), type: showType && !form.type ? "Please choose what you need." : "" };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!check()) { setStatus("idle"); return setErr("Please fix the highlighted fields."); }
    setStatus("sending"); setErr("");
    try {
      const r = await api.inquiry({
        property_id: target.id || null, property_title: target.title,
        client_name: form.name.trim(), client_phone: form.phone.trim(), client_email: form.email.trim(),
        message: `${showType ? `Enquiry type: ${form.type}\n` : ""}${form.msg}`.trim(),
      });
      if (r.ok) {
        const url = r.data.whatsapp_url || WA;
        setWaUrl(url); setStatus("sent");
        window.open(url, "_blank", "noopener");
      } else {
        setStatus("error");
        setErr(r.code && r.code < 500 && r.code !== 404 && r.data?.detail ? r.data.detail : "unreachable");
      }
    } catch { setStatus("error"); setErr("unreachable"); }
  };

  if (status === "sent") {
    return (
      <div className="form-ok" role="status">
        <i className="fa-solid fa-circle-check" />
        <h3>Thank you, we have received your enquiry</h3>
        <p>Our team will contact you soon. For a faster reply, message us on WhatsApp.</p>
        <Button variant="wa" brand icon="whatsapp" href={waUrl}> Continue on WhatsApp</Button>
      </div>
    );
  }

  const mail = mailLink(`Enquiry: ${target.title}`, `Name: ${form.name}\nPhone: ${form.phone}\n\n${form.msg}`);
  const field = (k, label, props) => (
    <div className={`field ${errors[k] ? "bad" : ""}`}>
      <label htmlFor={`${idPrefix}-${k}`}>{label} <span className="req" aria-hidden="true">*</span></label>
      <input id={`${idPrefix}-${k}`} value={form[k]} onChange={set(k)} onBlur={blur(k)} aria-required="true" aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `${idPrefix}-${k}-e` : undefined} {...props} />
      {errors[k] && <small className="ferr" id={`${idPrefix}-${k}-e`} role="alert">{errors[k]}</small>}
    </div>
  );

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <p className="req-note"><span className="req">*</span> Required fields</p>
      {field("name", "Full name", { autoComplete: "name", placeholder: "e.g. Ramesh Kumar" })}
      <div className="two">
        {field("phone", "Phone", { type: "tel", autoComplete: "tel", placeholder: "+91 99649 57015" })}
        {field("email", "Email", { type: "email", autoComplete: "email", placeholder: "name@example.com" })}
      </div>
      {showType && (
        <div className={`field ${errors.type ? "bad" : ""}`}>
          <label htmlFor={`${idPrefix}-type`}>I am interested in <span className="req" aria-hidden="true">*</span></label>
          <select id={`${idPrefix}-type`} value={form.type} onChange={set("type")} aria-required="true" aria-invalid={!!errors.type}>
            <option value="">Select one…</option>{TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          {errors.type && <small className="ferr" role="alert">{errors.type}</small>}
        </div>
      )}
      <div className="field"><label htmlFor={`${idPrefix}-msg`}>Message</label>
        <textarea id={`${idPrefix}-msg`} rows="3" value={form.msg} onChange={set("msg")} placeholder={placeholder} /></div>

      <p className="alt-contact">By sending, you agree to our <Link to="/terms" target="_blank">Terms &amp; Conditions</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>.</p>

      <div aria-live="polite">
        {status === "sending" && <p className="form-st"><i className="fa-solid fa-spinner fa-spin" /> Sending your enquiry…</p>}
        {status === "error" && err === "unreachable" && (
          <p className="form-err" role="alert">Your enquiry could not be sent because the enquiry service is not reachable right now.{" "}
            {import.meta.env.DEV && <em>(In local development, run the API as well, for example with wrangler, to test this form.)</em>}{" "}
            Please <a href={WA} target="_blank" rel="noopener">message us on WhatsApp</a> or call <a href={TEL}>{PHONE_PRETTY}</a>.</p>
        )}
        {status === "error" && err !== "unreachable" && <p className="form-err" role="alert">{err}</p>}
        {status === "idle" && err && <p className="form-err" role="alert">{err}</p>}
      </div>

      <Button type="submit" variant="wa" brand icon="whatsapp" disabled={status === "sending"}> {status === "sending" ? "Sending…" : "Send enquiry"}</Button>
      <p className="alt-contact">Or reach us directly: <a href={TEL}>{PHONE_PRETTY}</a> · <a href={mail}>{EMAIL}</a></p>
    </form>
  );
}
