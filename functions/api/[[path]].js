// SLR PROPERTIES - Cloudflare Pages Function (catch-all for /api/*)
// Bindings (set in the Cloudflare dashboard):  DB = D1 database,  BUCKET = R2 bucket
// Variables/secrets (set in dashboard):         ADMIN_USERNAME, ADMIN_PASSWORD

const WHATSAPP_PHONE = "919964957015";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // keep videos compressed; larger files can be linked by URL
const TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12 hours
const ALLOWED_MEDIA_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
const isHttpOrLocal = (u) => /^(\/api\/images\/|https?:\/\/)/i.test(u);

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    price_display TEXT NOT NULL,
    location TEXT NOT NULL,
    beds INTEGER DEFAULT 0,
    baths INTEGER DEFAULT 0,
    sqft INTEGER NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    images_json TEXT,
    is_featured INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    property_title TEXT,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    message TEXT,
    whatsapp_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
];

const U = "?auto=format&fit=crop&w=1200&q=80";
const SEED = [
  ["Golden Horizon Duplex House", "House", 18500000, "₹1.85 Cr", "Indiranagar, Bangalore", 4, 4, 3200,
    "Spacious independent duplex house with private garden, modern kitchen, solar water heating, and 2 covered car parking slots in prime residential layout.",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9" + U,
    JSON.stringify(["https://images.unsplash.com/photo-1600585154340-be6161a56a0c" + U, "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c" + U]), 1],
  ["Prime Highway Commercial Land", "Land", 35000000, "₹3.50 Cr", "Airport Road, Devanahalli, Bangalore", 0, 0, 21780,
    "1-Acre prime commercial clear-title land directly facing national highway. Ideal for resort, commercial warehouse, or corporate office hub.",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef" + U,
    JSON.stringify(["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b" + U]), 1],
  ["Royal Crest Gated Villa Plot", "Sites & Plots", 9500000, "₹95 Lakhs", "Whitefield, Bangalore", 0, 0, 2400,
    "A-Katha 40x60 corner plot inside premium gated community with Underground cabling, clubhouse access, 40ft wide tar roads, and 24/7 security.",
    "https://images.unsplash.com/photo-1524813686514-a57563d77965" + U,
    JSON.stringify(["https://images.unsplash.com/photo-1500382017468-9049fed747ef" + U]), 1],
  ["Grand High Street Retail Shop", "Rental Shops", 120000, "₹1.20 Lakh / Mo", "MG Road, Bangalore", 0, 1, 1400,
    "High footfall ground floor corner retail showroom shop space for rent with 30ft glass frontage, 3-phase commercial power, and HVAC points.",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5" + U,
    JSON.stringify(["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2" + U]), 0],
  ["Emerald Enclave Residential Site", "Sites & Plots", 6800000, "₹68 Lakhs", "Yelahanka, Bangalore", 0, 0, 1500,
    "30x50 East-facing BDA approved residential site ready for immediate construction with clear legal documentation and bank loan approvals.",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef" + U, "[]", 0],
  ["Luxury Boutique House", "House", 24000000, "₹2.40 Cr", "Jayanagar, Bangalore", 5, 5, 4100,
    "Architecturally designed 5-BHK luxury house with private elevator, home theatre setup, terrace lounge, and servant quarters.",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750" + U, "[]", 1],
];

// ---------- helpers ----------
const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra },
  });
const fail = (status, detail) => json({ status: "error", detail }, status);

let schemaReady = false;
async function ensureSchema(db) {
  if (schemaReady) return;
  await db.batch(SCHEMA.map((s) => db.prepare(s)));
  const row = await db.prepare("SELECT COUNT(*) AS c FROM properties").first();
  if (!row || row.c === 0) {
    const stmt = db.prepare(
      `INSERT INTO properties (title, category, price, price_display, location, beds, baths, sqft, description, image_url, images_json, is_featured, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available')`
    );
    await db.batch(SEED.map((r) => stmt.bind(...r)));
  }
  schemaReady = true;
}

const enc = new TextEncoder();
const b64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
async function makeToken(env) {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  return `${exp}.${await hmac(env.ADMIN_PASSWORD, `slr-admin:${env.ADMIN_USERNAME}:${exp}`)}`;
}
async function isAdmin(request, env) {
  const token = request.headers.get("X-Admin-Password") || "";
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const expected = await hmac(env.ADMIN_PASSWORD, `slr-admin:${env.ADMIN_USERNAME}:${exp}`);
  return safeEqual(sig, expected);
}

async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}
const str = (v, d = "") => (typeof v === "string" ? v.trim() : d);
const int = (v, d = 0) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };

// ---------- handlers ----------
async function listProperties(url, env) {
  const p = url.searchParams;
  let q = "SELECT * FROM properties WHERE 1=1";
  const args = [];
  const category = p.get("category");
  if (category && category !== "All") { q += " AND LOWER(category) = LOWER(?)"; args.push(category); }
  const location = p.get("location");
  if (location && location !== "All") { q += " AND LOWER(location) LIKE LOWER(?)"; args.push(`%${location}%`); }
  if (p.get("min_price")) { q += " AND price >= ?"; args.push(Number(p.get("min_price"))); }
  if (p.get("max_price")) { q += " AND price <= ?"; args.push(Number(p.get("max_price"))); }
  if (int(p.get("beds")) > 0) { q += " AND beds >= ?"; args.push(int(p.get("beds"))); }
  if (p.get("featured") === "true") q += " AND is_featured = 1";
  const search = p.get("search");
  if (search) {
    q += " AND (LOWER(title) LIKE LOWER(?) OR LOWER(location) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))";
    args.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  q += " ORDER BY is_featured DESC, id DESC";
  const { results } = await env.DB.prepare(q).bind(...args).all();
  return json({ status: "success", count: results.length, data: results });
}

async function getProperty(id, env) {
  const row = await env.DB.prepare("SELECT * FROM properties WHERE id = ?").bind(id).first();
  return row ? json({ status: "success", data: row }) : fail(404, "Property not found");
}

async function adminLogin(request, env) {
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) return fail(500, "ADMIN_USERNAME / ADMIN_PASSWORD are not configured in Cloudflare.");
  const body = await readJson(request);
  if (!body) return fail(400, "Invalid request body");
  const okUser = safeEqual(str(body.username), env.ADMIN_USERNAME);
  const okPass = safeEqual(String(body.password ?? ""), env.ADMIN_PASSWORD);
  if (!(okUser && okPass)) return fail(401, "Invalid admin username or password");
  return json({ status: "success", message: "Admin authentication successful", token: await makeToken(env) });
}

// Shared validation for create + update
function parseProperty(b) {
  if (!b) return { error: fail(400, "Invalid request body") };
  const title = str(b.title), category = str(b.category), location = str(b.location);
  const price_display = str(b.price_display), description = str(b.description), image_url = str(b.image_url);
  const price = Number(b.price), sqft = int(b.sqft);
  if (!title || !category || !location || !price_display || !description || !image_url || !Number.isFinite(price) || sqft <= 0)
    return { error: fail(422, "Missing or invalid property fields") };
  if (!isHttpOrLocal(image_url)) return { error: fail(422, "Cover media must be an uploaded file or an http(s) link") };
  let gallery = [];
  try { gallery = JSON.parse(str(b.images_json, "[]") || "[]"); } catch { return { error: fail(422, "Invalid gallery data") }; }
  if (!Array.isArray(gallery) || gallery.length > 30 || !gallery.every((u) => typeof u === "string" && isHttpOrLocal(u)))
    return { error: fail(422, "Gallery must be a list of uploaded files or http(s) links") };
  const status = ["Available", "Sold", "Rented", "Under Offer"].includes(str(b.status)) ? str(b.status) : "Available";
  return { v: [title, category, price, price_display, location, int(b.beds), int(b.baths), sqft, description, image_url, JSON.stringify(gallery), b.is_featured ? 1 : 0, status] };
}

async function createProperty(request, env) {
  const { v, error } = parseProperty(await readJson(request));
  if (error) return error;
  const res = await env.DB.prepare(
    `INSERT INTO properties (title, category, price, price_display, location, beds, baths, sqft, description, image_url, images_json, is_featured, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(...v).run();
  return json({ status: "success", message: "Property added successfully", id: res.meta.last_row_id });
}

async function updateProperty(id, request, env) {
  const old = await env.DB.prepare("SELECT image_url, images_json FROM properties WHERE id = ?").bind(id).first();
  if (!old) return fail(404, "Property not found");
  const { v, error } = parseProperty(await readJson(request));
  if (error) return error;
  await env.DB.prepare(
    `UPDATE properties SET title=?, category=?, price=?, price_display=?, location=?, beds=?, baths=?, sqft=?, description=?, image_url=?, images_json=?, is_featured=?, status=? WHERE id=?`
  ).bind(...v, id).run();
  // Remove R2 files that are no longer used by this listing
  try {
    const keep = new Set([v[9], ...JSON.parse(v[10])]);
    const before = [old.image_url, ...JSON.parse(old.images_json || "[]")];
    const gone = before.filter((u) => typeof u === "string" && u.startsWith("/api/images/") && !keep.has(u))
      .map((u) => decodeURIComponent(u.slice("/api/images/".length)));
    if (gone.length && env.BUCKET) await env.BUCKET.delete(gone);
  } catch { /* ignore cleanup errors */ }
  return json({ status: "success", message: `Property #${id} updated` });
}

async function deleteProperty(id, env) {
  const row = await env.DB.prepare("SELECT image_url, images_json FROM properties WHERE id = ?").bind(id).first();
  if (!row) return fail(404, "Property not found");
  await env.DB.prepare("DELETE FROM properties WHERE id = ?").bind(id).run();
  // Clean up any R2 images that belonged to this listing
  try {
    const extra = JSON.parse(row.images_json || "[]");
    const keys = [row.image_url, ...extra]
      .filter((u) => typeof u === "string" && u.startsWith("/api/images/"))
      .map((u) => decodeURIComponent(u.slice("/api/images/".length)));
    if (keys.length && env.BUCKET) await env.BUCKET.delete(keys);
  } catch { /* ignore cleanup errors */ }
  return json({ status: "success", message: `Property #${id} removed successfully` });
}

async function createInquiry(request, env) {
  const b = await readJson(request);
  if (!b) return fail(400, "Invalid request body");
  const client_name = str(b.client_name), client_email = str(b.client_email), client_phone = str(b.client_phone);
  if (!client_name || !client_email || !client_phone) return fail(422, "Name, email and phone are required");
  const property_title = str(b.property_title, "General Inquiry") || "General Inquiry";
  const message = str(b.message);
  const text =
    `*NEW PROPERTY INQUIRY - SLR PROPERTIES*\n` +
    `✨ *Property:* ${property_title}\n👤 *Name:* ${client_name}\n📱 *Phone:* ${client_phone}\n📧 *Email:* ${client_email}\n` +
    `💬 *Message:* ${message || "I would like to receive details on this property."}\n\n_Securing Your Space in the Future._`;
  const whatsapp_url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
  const res = await env.DB.prepare(
    `INSERT INTO inquiries (property_id, property_title, client_name, client_email, client_phone, message, whatsapp_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(b.property_id ?? null, property_title, client_name, client_email, client_phone, message, whatsapp_url).run();
  return json({ status: "success", message: "Inquiry recorded successfully", inquiry_id: res.meta.last_row_id, whatsapp_url });
}

async function listInquiries(env) {
  const { results } = await env.DB.prepare("SELECT * FROM inquiries ORDER BY id DESC").all();
  return json({ status: "success", count: results.length, data: results });
}

async function deleteInquiry(id, env) {
  await env.DB.prepare("DELETE FROM inquiries WHERE id = ?").bind(id).run();
  return json({ status: "success", message: `Inquiry #${id} removed` });
}

// R2: upload a photo or video (admin). The file is sent as the raw request body and
// streamed straight into R2 (no buffering), so large videos do not exhaust Worker memory.
async function uploadMedia(request, env) {
  if (!env.BUCKET) return fail(500, "R2 bucket binding 'BUCKET' is not configured.");
  const type = (request.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
  const ext = ALLOWED_MEDIA_TYPES[type];
  if (!ext) return fail(415, "Allowed: JPG, PNG, WEBP, GIF, AVIF images and MP4, WEBM, MOV videos");
  const size = Number(request.headers.get("Content-Length"));
  if (!Number.isFinite(size) || size <= 0) return fail(411, "Content-Length required");
  const limit = type.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (size > limit) return fail(413, `${type.startsWith("video/") ? "Video" : "Image"} must be ${limit / 1024 / 1024} MB or smaller`);
  if (!request.body) return fail(400, "Empty upload");
  const key = `properties/${crypto.randomUUID()}.${ext}`;
  await env.BUCKET.put(key, request.body, { httpMetadata: { contentType: type } });
  return json({ status: "success", key, url: `/api/images/${key}`, type: type.startsWith("video/") ? "video" : "image" });
}

// R2: public media delivery, with HTTP Range support so videos can seek / play on iOS Safari
async function serveMedia(key, request, env) {
  if (!env.BUCKET) return fail(500, "R2 bucket binding 'BUCKET' is not configured.");
  const ranged = request.headers.has("Range");
  const obj = await env.BUCKET.get(key, ranged ? { range: request.headers } : undefined);
  if (!obj) return fail(404, "File not found");
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("ETag", obj.httpEtag);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  if (!ranged && request.headers.get("If-None-Match") === obj.httpEtag) return new Response(null, { status: 304, headers });
  if (ranged && obj.range) {
    let start, end;
    if ("suffix" in obj.range) { start = obj.size - obj.range.suffix; end = obj.size - 1; }
    else { start = obj.range.offset ?? 0; end = start + (obj.range.length ?? obj.size - start) - 1; }
    headers.set("Content-Range", `bytes ${start}-${end}/${obj.size}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(request.method === "HEAD" ? null : obj.body, { status: 206, headers });
  }
  headers.set("Content-Length", String(obj.size));
  return new Response(request.method === "HEAD" ? null : obj.body, { headers });
}

// ---------- router ----------
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");
  const method = request.method;

  try {
    if (!env.DB) return fail(500, "D1 binding 'DB' is not configured. Add it in Settings → Bindings.");

    // Public photo/video delivery (no schema init needed)
    if (path.startsWith("/api/images/") && (method === "GET" || method === "HEAD"))
      return serveMedia(decodeURIComponent(path.slice("/api/images/".length)), request, env);

    await ensureSchema(env.DB);

    if (path === "/api/properties" && method === "GET") return listProperties(url, env);
    let m = path.match(/^\/api\/properties\/(\d+)$/);
    if (m && method === "GET") return getProperty(Number(m[1]), env);

    if (path === "/api/inquiries" && method === "POST") return createInquiry(request, env);
    if (path === "/api/admin/login" && method === "POST") return adminLogin(request, env);

    if (path.startsWith("/api/admin/")) {
      if (!env.ADMIN_PASSWORD || !(await isAdmin(request, env))) return fail(401, "Unauthorized admin action");
      if (path === "/api/admin/properties" && method === "POST") return createProperty(request, env);
      m = path.match(/^\/api\/admin\/properties\/(\d+)$/);
      if (m && method === "PUT") return updateProperty(Number(m[1]), request, env);
      if (m && method === "DELETE") return deleteProperty(Number(m[1]), env);
      const qi = path.match(/^\/api\/admin\/inquiries\/(\d+)$/);
      if (qi && method === "DELETE") return deleteInquiry(Number(qi[1]), env);
      if (path === "/api/admin/inquiries" && method === "GET") return listInquiries(env);
      if (path === "/api/admin/upload" && method === "POST") return uploadMedia(request, env);
    }
    return fail(404, "Not found");
  } catch (err) {
    console.error(err);
    return fail(500, "Internal server error");
  }
}
