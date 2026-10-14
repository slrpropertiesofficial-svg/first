import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../utils/api.js";
import { GROUPS, info, isRent } from "../utils/categories.js";
import { isVideo, safeUrl, gallery as galleryOf } from "../utils/property.js";
import { priceLabel, store } from "../utils/format.js";
import { embedUrl, parsePin } from "../utils/geo.js";
import "../styles/admin.css";

const STATUSES = ["Available", "Under Offer", "Sold", "Rented"];
const EMPTY = { title: "", category: "Houses", location: "", price: "", price_display: "", beds: 0, baths: 0, sqft: 2400, description: "", is_featured: false, status: "Available", lat: "", lng: "" };
const MAX_IMG = 10 * 1024 * 1024, MAX_VID = 50 * 1024 * 1024;

const Thumb = ({ u }) => isVideo(u)
  ? <span className="thumb vid"><i className="fa-solid fa-play" /></span>
  : <img className="thumb" src={safeUrl(u)} alt="" />;

export default function Admin() {
  const [token, setToken] = useState(() => store.get("slr_admin_token", null));
  const logout = useCallback(() => { store.set("slr_admin_token", null); setToken(null); }, []);
  return token ? <Dashboard token={token} logout={logout} /> : <Login onDone={(t) => { store.set("slr_admin_token", t); setToken(t); }} />;
}

function Login({ onDone }) {
  const [mode, setMode] = useState(null);
  useEffect(() => { api.authMode().then((r) => setMode(r.ok ? r.data : { otp: false, password: true })).catch(() => setMode({ otp: false, password: true })); }, []);
  if (!mode) return <div className="login"><div className="login-card"><p className="muted">Loading…</p></div></div>;
  return mode.otp ? <OtpLogin onDone={onDone} password={mode.password} /> : <PasswordLogin onDone={onDone} />;
}

function OtpLogin({ onDone, password }) {
  const [email, setEmail] = useState(() => store.get("slr_owner_email", ""));
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [wait, setWait] = useState(0);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [usePw, setUsePw] = useState(false);

  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t); }, [wait]);

  const send = async (e) => {
    e?.preventDefault(); setBusy(true); setErr("");
    try {
      const r = await api.otpRequest(email.trim());
      if (r.ok) { store.set("slr_owner_email", email.trim()); setSent(true); setCode(""); setWait(r.data.resend_in || 60); }
      else setErr(r.data.detail || "Could not send the code.");
    } catch { setErr("Cannot reach the server. Check your connection."); }
    setBusy(false);
  };
  const verify = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const r = await api.otpVerify(email.trim(), code);
      r.ok ? onDone(r.data.token) : setErr(r.data.detail || "Sign-in failed.");
    } catch { setErr("Cannot reach the server. Check your connection."); }
    setBusy(false);
  };

  if (usePw) return <PasswordLogin onDone={onDone} onBack={() => setUsePw(false)} />;
  return (
    <div className="login">
      <form className="login-card" onSubmit={sent ? verify : send}>
        <img src="/logo.jpg" alt="SLR Properties" />
        <h1>Owner portal</h1>
        <p className="q">"Securing Your Space in the Future."</p>
        {!sent ? (<>
          <label>Owner email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required autoFocus /></label>
          <p className="hint">We will email you a 6-digit login code.</p>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="abtn gold-b" disabled={busy}>{busy ? "Sending…" : "Send login code"}</button>
        </>) : (<>
          <p className="hint">If <b>{email}</b> is the owner's email, a code is on its way. It works for 5 minutes.</p>
          <label>6-digit code<input className="otp" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="••••••" required autoFocus /></label>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="abtn gold-b" disabled={busy || code.length !== 6}>{busy ? "Checking…" : "Sign in"}</button>
          <div className="otp-row">
            <button type="button" className="linkb" disabled={busy || wait > 0} onClick={send}>{wait > 0 ? `Resend code in ${wait}s` : "Resend code"}</button>
            <button type="button" className="linkb" onClick={() => { setSent(false); setErr(""); }}>Change email</button>
          </div>
        </>)}
        {password && <button type="button" className="linkb" onClick={() => setUsePw(true)}>Use password instead</button>}
        <a href="/" className="back">← Back to website</a>
      </form>
    </div>
  );
}

function PasswordLogin({ onDone, onBack }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const r = await api.login(u, p);
      r.ok ? onDone(r.data.token) : setErr(r.data.detail || "Sign-in failed.");
    } catch { setErr("Cannot reach the server. Check your connection."); }
    setBusy(false);
  };
  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <img src="/logo.jpg" alt="SLR Properties" />
        <h1>Owner portal</h1>
        <p className="q">"Securing Your Space in the Future."</p>
        <label>Username<input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" required /></label>
        <label>Password<input type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" required /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="abtn gold-b" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        {onBack && <button type="button" className="linkb" onClick={onBack}>Use email code instead</button>}
        <a href="/" className="back">← Back to website</a>
      </form>
    </div>
  );
}

function Dashboard({ token, logout }) {
  const [props, setProps] = useState([]);
  const [inqs, setInqs] = useState([]);
  const [tab, setTab] = useState("properties");
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  const [iq, setIq] = useState("");
  const [toast, setToast] = useState("");

  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 2600); };
  const load = useCallback(async () => {
    const [a, b] = await Promise.all([api.properties(), api.adminInquiries(token)]);
    if (b.code === 401) return logout();
    if (a.ok) setProps(a.data.data);
    if (b.ok) setInqs(b.data.data);
  }, [token, logout]);
  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const sale = props.filter((p) => !isRent(p) && p.status !== "Sold");
    const value = sale.reduce((s, p) => s + (p.price || 0), 0);
    const week = Date.now() - 7 * 864e5;
    return {
      total: props.length, value, featured: props.filter((p) => p.is_featured).length,
      live: props.filter((p) => !p.status || p.status === "Available").length,
      inq: inqs.length, newInq: inqs.filter((i) => new Date(i.created_at + "Z").getTime() > week).length,
    };
  }, [props, inqs]);

  const put = async (p, patch, msg) => {
    const r = await api.updateProperty(p.id, { ...p, ...patch }, token);
    if (r.code === 401) return logout();
    r.ok ? (say(msg), load()) : say(r.data.detail || "Update failed");
  };
  const remove = async (p) => {
    if (!confirm(`Delete "${p.title}"? Its uploaded photos and videos will also be removed.`)) return;
    const r = await api.deleteProperty(p.id, token);
    r.ok ? (say("Property deleted"), load()) : say(r.data.detail || "Delete failed");
  };
  const removeInq = async (i) => {
    if (!confirm(`Delete the enquiry from ${i.client_name}?`)) return;
    const r = await api.deleteInquiry(i.id, token);
    r.ok ? (say("Enquiry deleted"), load()) : say(r.data.detail || "Delete failed");
  };
  const exportCsv = () => {
    const rows = [["Date", "Name", "Phone", "Email", "Property", "Message"], ...inqs.map((i) => [i.created_at, i.client_name, i.client_phone, i.client_email, i.property_title, (i.message || "").replace(/\s+/g, " ")])];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: "slr-enquiries.csv" });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const shown = props.filter((p) => `${p.title} ${p.location} ${p.category}`.toLowerCase().includes(q.toLowerCase()));
  const shownI = inqs.filter((i) => `${i.client_name} ${i.client_phone} ${i.client_email} ${i.property_title}`.toLowerCase().includes(iq.toLowerCase()));

  return (
    <div className="admin">
      <header className="a-nav">
        <div className="brand"><img src="/logo.jpg" alt="" /><div><b>SLR PROPERTIES</b><small>Owner console</small></div></div>
        <div className="a-nav-r">
          <a className="abtn ghost" href="/" target="_blank" rel="noopener"><i className="fa-solid fa-arrow-up-right-from-square" /> View site</a>
          <button className="abtn danger" onClick={logout}><i className="fa-solid fa-right-from-bracket" /> Log out</button>
        </div>
      </header>

      <main className="a-main">
        <div className="a-stats">
          <div><small>Listings</small><b>{stats.total}</b><span>{stats.live} available</span></div>
          <div><small>Sale inventory value</small><b className="g">{priceLabel(stats.value)}</b><span>excludes rentals &amp; sold</span></div>
          <div><small>Enquiries</small><b>{stats.inq}</b><span>{stats.newInq} in last 7 days</span></div>
          <div><small>Featured</small><b className="g">{stats.featured}</b><span>shown first on site</span></div>
        </div>

        <div className="a-tabs" role="tablist">
          <button role="tab" aria-selected={tab === "properties"} className={tab === "properties" ? "on" : ""} onClick={() => setTab("properties")}><i className="fa-solid fa-building" /> Properties</button>
          <button role="tab" aria-selected={tab === "inquiries"} className={tab === "inquiries" ? "on" : ""} onClick={() => setTab("inquiries")}><i className="fa-solid fa-envelope-open-text" /> Enquiries <span className="pillc">{inqs.length}</span></button>
        </div>

        {tab === "properties" && (
          <section>
            <div className="a-bar">
              <input className="a-search" type="search" placeholder="Search title, location, category" value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="abtn gold-b" onClick={() => setEditing("new")}><i className="fa-solid fa-plus" /> Add property</button>
            </div>
            <div className="a-table"><table>
              <thead><tr><th>Property</th><th>Category</th><th>Price</th><th>Specs</th><th>Status</th><th>Featured</th><th /></tr></thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id}>
                    <td><div className="pcell"><Thumb u={p.image_url} /><div><b>{p.title}</b><small><i className="fa-solid fa-location-dot" /> {p.location}</small></div></div></td>
                    <td className="g">{info(p.category).sub}</td>
                    <td className="serif">{p.price_display}</td>
                    <td className="muted">{info(p.category).g?.id === "residential" ? `${p.beds} bd · ${p.baths} ba · ` : ""}{Number(p.sqft).toLocaleString("en-IN")} sq.ft</td>
                    <td><select className={`st st-${(p.status || "Available").replace(/\s/g, "")}`} value={p.status || "Available"} onChange={(e) => put(p, { status: e.target.value }, "Status updated")}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
                    <td><button className={`star ${p.is_featured ? "on" : ""}`} aria-pressed={!!p.is_featured} aria-label="Toggle featured"
                      onClick={() => put(p, { is_featured: p.is_featured ? 0 : 1 }, p.is_featured ? "Removed from featured" : "Marked as featured")}><i className="fa-solid fa-star" /></button></td>
                    <td className="acts"><button className="abtn sm" onClick={() => setEditing(p)}><i className="fa-solid fa-pen" /> Edit</button>
                      <button className="abtn sm danger" onClick={() => remove(p)} aria-label={`Delete ${p.title}`}><i className="fa-solid fa-trash" /></button></td>
                  </tr>
                ))}
                {!shown.length && <tr><td colSpan="7" className="empty-r">{props.length ? "No properties match your search." : "No properties yet. Use “Add property” to publish your first listing."}</td></tr>}
              </tbody>
            </table></div>
          </section>
        )}

        {tab === "inquiries" && (
          <section>
            <div className="a-bar">
              <input className="a-search" type="search" placeholder="Search name, phone, property" value={iq} onChange={(e) => setIq(e.target.value)} />
              <button className="abtn" onClick={exportCsv} disabled={!inqs.length}><i className="fa-solid fa-file-csv" /> Export CSV</button>
            </div>
            <div className="a-table"><table>
              <thead><tr><th>Date</th><th>Client</th><th>Property</th><th>Message</th><th /></tr></thead>
              <tbody>
                {shownI.map((i) => (
                  <tr key={i.id}>
                    <td className="muted nowrap">{new Date(i.created_at + "Z").toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td><b>{i.client_name}</b><small>{i.client_phone}<br />{i.client_email}</small></td>
                    <td className="g">{i.property_title || "General"}</td>
                    <td className="msg">{i.message || "—"}</td>
                    <td className="acts">
                      {i.client_email && <a className="abtn sm mail" href={`mailto:${i.client_email}?subject=${encodeURIComponent(`Your enquiry - ${i.property_title || "SLR Properties"}`)}&body=${encodeURIComponent(`Hello ${i.client_name},\n\nThank you for your enquiry with SLR Properties.\n\n`)}`} aria-label={`Email ${i.client_name}`}><i className="fa-solid fa-envelope" /></a>}
                      <a className="abtn sm" href={`tel:${i.client_phone}`} aria-label="Call"><i className="fa-solid fa-phone" /></a>
                      <button className="abtn sm danger" onClick={() => removeInq(i)} aria-label="Delete enquiry"><i className="fa-solid fa-trash" /></button>
                    </td>
                  </tr>
                ))}
                {!shownI.length && <tr><td colSpan="5" className="empty-r">{inqs.length ? "No enquiries match your search." : "No enquiries yet. They appear here when visitors use the enquiry form."}</td></tr>}
              </tbody>
            </table></div>
          </section>
        )}
      </main>

      {editing && <PropertyForm token={token} initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} logout={logout}
        onSaved={(m) => { setEditing(null); say(m); load(); }} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function PropertyForm({ token, initial, onClose, onSaved, logout }) {
  const editing = !!initial;
  const [f, setF] = useState(() => editing ? { ...EMPTY, ...initial, is_featured: !!initial.is_featured } : EMPTY);
  const [autoPrice, setAutoPrice] = useState(!editing);
  const [cover, setCover] = useState(editing ? initial.image_url : "");
  const [coverFile, setCoverFile] = useState(null);
  const [kept, setKept] = useState(() => editing ? galleryOf(initial).slice(1) : []);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [pinText, setPinText] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const rent = info(f.category).g?.id === "commercial";
  const resid = info(f.category).g?.id === "residential";

  useEffect(() => {
    if (autoPrice && f.price !== "") setF((x) => ({ ...x, price_display: priceLabel(Number(x.price), rent) }));
  }, [f.price, rent, autoPrice]);

  const pin = f.lat !== "" && f.lat !== null && f.lng !== "" && f.lng !== null ? { lat: Number(f.lat), lng: Number(f.lng) } : null;
  const readPin = (text) => {
    setPinText(text);
    if (!text.trim()) return setPinMsg("");
    const got = parsePin(text);
    if (got) { setF((x) => ({ ...x, lat: got.lat, lng: got.lng })); setPinMsg(""); }
    else setPinMsg(/goo\.gl|maps\.app/i.test(text) ? "Short links cannot be read. Open the link, then copy the long address from the browser bar (it has @12.97…,77.64…)." : "Could not find a location in that. Paste the full Google Maps link, or the coordinates like 12.9784, 77.6408.");
  };

  const upload = async (file, label) => {
    const vid = file.type.startsWith("video/");
    if (!vid && !file.type.startsWith("image/")) throw new Error(`${file.name}: unsupported file type`);
    if (file.size > (vid ? MAX_VID : MAX_IMG)) throw new Error(`${file.name}: too large (max ${vid ? 50 : 10} MB)`);
    setBusy(`Uploading ${label}…`);
    const r = await api.upload(file, token);
    if (r.code === 401) { logout(); throw new Error("Session expired. Please sign in again."); }
    if (!r.ok) throw new Error(`${file.name}: ${r.data.detail || "upload failed"}`);
    return r.data.url;
  };

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (!coverFile && !cover.trim()) return setErr("Add a cover photo or video, or paste a link.");
    try {
      setBusy("Saving…");
      const coverUrl = coverFile ? await upload(coverFile, "cover") : cover.trim();
      const gallery = [...kept];
      for (let i = 0; i < files.length; i++) gallery.push(await upload(files[i], `gallery ${i + 1} of ${files.length}`));
      setBusy("Publishing…");
      const body = { ...f, lat: pin ? pin.lat : null, lng: pin ? pin.lng : null, price: Number(f.price), beds: +f.beds || 0, baths: +f.baths || 0, sqft: +f.sqft || 0, image_url: coverUrl, images_json: JSON.stringify(gallery), is_featured: f.is_featured ? 1 : 0 };
      const r = editing ? await api.updateProperty(initial.id, body, token) : await api.createProperty(body, token);
      if (r.code === 401) return logout();
      r.ok ? onSaved(editing ? "Property updated" : "Property published") : setErr(r.data.detail || "Could not save the property.");
    } catch (x) { setErr(x.message || "Server connection error."); }
    setBusy("");
  };

  return (
    <div className="a-modal" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <form className="a-sheet" onSubmit={submit}>
        <div className="a-sheet-h"><h2>{editing ? "Edit property" : "Add property"}</h2><button type="button" className="abtn sm" onClick={onClose} disabled={!!busy}>Close</button></div>
        <div className="fgrid3">
          <label className="span2">Title *<input required value={f.title} onChange={set("title")} placeholder="e.g. Royal Crest Gated Plot" /></label>
          <label>Category *<select value={f.category} onChange={set("category")}>
            {GROUPS.map((g) => <optgroup key={g.id} label={g.label}>{g.subs.map((s) => <option key={s}>{s}</option>)}</optgroup>)}
            {!GROUPS.some((g) => g.subs.includes(f.category)) && <option>{f.category}</option>}</select></label>
          <label className="span2">Location *<input required value={f.location} onChange={set("location")} placeholder="e.g. Indiranagar, Bangalore" /></label>
          <label>Status<select value={f.status} onChange={set("status")}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label>{rent ? "Monthly rent (₹) *" : "Price (₹) *"}<input required type="number" min="0" value={f.price} onChange={set("price")} placeholder={rent ? "120000" : "18500000"} /></label>
          <label>Display price *<input required value={f.price_display} onChange={(e) => { setAutoPrice(false); set("price_display")(e); }} placeholder="₹1.85 Cr" />
            <small>{autoPrice ? "Filled in automatically from the price." : "Edited by hand."}</small></label>
          <label>Area (sq.ft) *<input required type="number" min="1" value={f.sqft} onChange={set("sqft")} /></label>
          {resid && <><label>Bedrooms<input type="number" min="0" value={f.beds} onChange={set("beds")} /></label>
            <label>Bathrooms<input type="number" min="0" value={f.baths} onChange={set("baths")} /></label></>}
          {!resid && rent && <label>Restrooms<input type="number" min="0" value={f.baths} onChange={set("baths")} /></label>}

          <div className="span3 media-box">
            <b>Map location <span className="opt">(optional, shows the exact pin on the website map)</span></b>
            <input value={pinText} onChange={(e) => readPin(e.target.value)} placeholder="Paste a Google Maps link, or coordinates like 12.9784, 77.6408" />
            <small>In Google Maps: find the plot, tap and hold to drop a pin, then copy the address bar link (or the coordinates shown). Leave empty to show the approximate area.</small>
            {pinMsg && <p className="err" role="alert">{pinMsg}</p>}
            {pin && (<>
              <p className="pin-ok"><i className="fa-solid fa-location-dot" /> Pin set: {pin.lat}, {pin.lng} <button type="button" className="abtn sm" onClick={() => { setF({ ...f, lat: "", lng: "" }); setPinText(""); }}>Remove pin</button></p>
              <iframe className="pin-prev" title="Pin preview" src={embedUrl({ lat: pin.lat, lng: pin.lng })} loading="lazy" />
            </>)}
          </div>

          <div className="span3 media-box">
            <b>Cover photo or video *</b>
            <div className="mrow">
              {(coverFile || cover) && <div className="prev">{coverFile ? <img src={URL.createObjectURL(coverFile)} alt="" /> : <Thumb u={cover} />}</div>}
              <div className="mcol">
                <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" onChange={(e) => setCoverFile(e.target.files[0] || null)} />
                <input type="url" placeholder="…or paste an image / video link" value={coverFile ? "" : cover} disabled={!!coverFile} onChange={(e) => setCover(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="span3 media-box">
            <b>Gallery</b>
            {kept.length > 0 && <div className="kept">{kept.map((u, i) => (
              <div className="k" key={u}><Thumb u={u} /><button type="button" aria-label="Remove from gallery" onClick={() => setKept(kept.filter((_, x) => x !== i))}><i className="fa-solid fa-xmark" /></button></div>))}</div>}
            <input type="file" multiple accept="image/*,video/mp4,video/webm,video/quicktime" onChange={(e) => setFiles([...e.target.files])} />
            <small>{files.length ? `${files.length} new file(s) selected. ` : ""}Images up to 10 MB, videos (MP4, WEBM, MOV) up to 50 MB.</small>
          </div>

          <label className="span3">Description *<textarea required rows="4" value={f.description} onChange={set("description")} placeholder="Plot size, road width, approvals, key features…" /></label>
          <label className="chk span3"><input type="checkbox" checked={f.is_featured} onChange={set("is_featured")} /> Feature this property (shown first on the website)</label>
        </div>
        {err && <p className="err" role="alert">{err}</p>}
        <div className="a-sheet-f">
          <button type="button" className="abtn" onClick={onClose} disabled={!!busy}>Cancel</button>
          <button className="abtn gold-b" disabled={!!busy}>{busy || (editing ? "Save changes" : "Publish listing")}</button>
        </div>
      </form>
    </div>
  );
}
