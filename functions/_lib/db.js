export const SCHEMA = [
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
    lat REAL,
    lng REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
  )`,
  `CREATE TABLE IF NOT EXISTS login_otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
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

let schemaReady = false;

export async function ensureSchema(db) {
  if (schemaReady) return;
  await db.batch(SCHEMA.map((s) => db.prepare(s)));
  for (const [col, type] of [["lat", "REAL"], ["lng", "REAL"], ["updated_at", "DATETIME"]]) {
    try { await db.prepare(`ALTER TABLE properties ADD COLUMN ${col} ${type}`).run(); } catch { }
  }
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

export async function allProperties(db) {
  const { results } = await db.prepare("SELECT * FROM properties ORDER BY is_featured DESC, id DESC").all();
  return results;
}
