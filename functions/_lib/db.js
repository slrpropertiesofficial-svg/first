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

let schemaReady = false;

export async function ensureSchema(db) {
  if (schemaReady) return;
  await db.batch(SCHEMA.map((s) => db.prepare(s)));
  for (const [col, type] of [["lat", "REAL"], ["lng", "REAL"], ["updated_at", "DATETIME"]]) {
    try { await db.prepare(`ALTER TABLE properties ADD COLUMN ${col} ${type}`).run(); } catch { }
  }
  schemaReady = true;
}

export async function allProperties(db) {
  const { results } = await db.prepare("SELECT * FROM properties ORDER BY is_featured DESC, id DESC").all();
  return results;
}
