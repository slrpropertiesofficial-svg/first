import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../utils/api.js";
import { GROUPS, info, isRent } from "../utils/categories.js";
import { isVideo, safeUrl, gallery as galleryOf } from "../utils/property.js";
import { priceLabel, store } from "../utils/format.js";
import "../styles/admin.css";

const STATUSES = ["Available", "Under Offer", "Sold", "Rented"];
const EMPTY = { title: "", category: "Houses", location: "", price: "", price_display: "", beds: 0, baths: 0, sqft: 2400, description: "", is_featured: false, status: "Available" };
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
        <a href="/" className="back">← Back to website</a>
      </form>
    </div>
  );
}

function Dashboard({ token, logout }) {
  const [props, setProps] = useState([]);
  const [inqs, setInqs] = useState([]);
  const [tab, setTab] = useState("properties");
  const [editing, setEditing] = useState(null); // null | "new" | property
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
                      {i.whatsapp_url && <a className="abtn sm wa" href={i.whatsapp_url} target="_blank" rel="noopener" aria-label="Open WhatsApp"><i className="fa-brands fa-whatsapp" /></a>}
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
  const [cover, setCover] = useState(editing ? initial.image_url : "");       // existing/linked cover
  const [coverFile, setCoverFile] = useState(null);
  const [kept, setKept] = useState(() => editing ? galleryOf(initial).slice(1) : []);  // existing gallery
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const rent = info(f.category).g?.id === "commercial";
  const resid = info(f.category).g?.id === "residential";

  useEffect(() => { // keep the display price in sync until the owner edits it by hand
    if (autoPrice && f.price !== "") setF((x) => ({ ...x, price_display: priceLabel(Number(x.price), rent) }));
  }, [f.price, rent, autoPrice]);

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
      const body = { ...f, price: Number(f.price), beds: +f.beds || 0, baths: +f.baths || 0, sqft: +f.sqft || 0, image_url: coverUrl, images_json: JSON.stringify(gallery), is_featured: f.is_featured ? 1 : 0 };
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
