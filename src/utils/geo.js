// Map helpers. Each listing can carry an exact pin (lat/lng, set in the owner console).
// Listings without one fall back to the centre of their area, marked "approximate".

export const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";
export const BENGALURU = { lat: 12.9716, lng: 77.5946 };

// Approximate area centres (checked against the whole location text, longest name first).
const AREAS = {
  "devanahalli": [13.2473, 77.7120], "airport road": [13.1986, 77.7066], "indiranagar": [12.9784, 77.6408],
  "mg road": [12.9756, 77.6068], "whitefield": [12.9698, 77.7500], "yelahanka": [13.1007, 77.5963],
  "jayanagar": [12.9308, 77.5838], "koramangala": [12.9352, 77.6245], "hebbal": [13.0358, 77.5970],
  "electronic city": [12.8452, 77.6602], "hsr layout": [12.9116, 77.6474], "jp nagar": [12.9063, 77.5857],
  "sarjapur": [12.8600, 77.7870], "bannerghatta": [12.8000, 77.5770], "kr puram": [13.0050, 77.6960],
  "hennur": [13.0400, 77.6400], "marathahalli": [12.9591, 77.6974], "rajajinagar": [12.9915, 77.5520],
  "malleshwaram": [13.0035, 77.5710], "banashankari": [12.9255, 77.5468], "bellandur": [12.9304, 77.6784],
  "kanakapura": [12.8000, 77.4600], "yeshwanthpur": [13.0285, 77.5400], "hosur road": [12.9000, 77.6400],
  "bangalore": [12.9716, 77.5946], "bengaluru": [12.9716, 77.5946],
};
const AREA_KEYS = Object.keys(AREAS); // order matters: specific places come before general ones

const num = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v));
export const hasPin = (p) => Number.isFinite(num(p.lat)) && Number.isFinite(num(p.lng));

// -> { lat, lng, exact } or null when nothing can be placed
export function pointOf(p) {
  if (hasPin(p)) return { lat: num(p.lat), lng: num(p.lng), exact: true };
  const text = String(p.location || "").toLowerCase();
  const k = AREA_KEYS.find((a) => text.includes(a));
  if (!k) return null;
  // tiny repeatable offset so several listings in one area do not sit exactly on top of each other
  const j = ((p.id * 9301 + 49297) % 233280) / 233280 - 0.5;
  const j2 = ((p.id * 7919 + 12347) % 104729) / 104729 - 0.5;
  return { lat: AREAS[k][0] + j * 0.012, lng: AREAS[k][1] + j2 * 0.012, exact: false };
}

export const directionsUrl = (p) => {
  const pt = hasPin(p) ? `${num(p.lat)},${num(p.lng)}` : `${p.title}, ${p.location}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pt)}`;
};
export const openMapUrl = (p) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hasPin(p) ? `${num(p.lat)},${num(p.lng)}` : `${p.title}, ${p.location}`)}`;

// Keyless embed (works without an API key) for a single place
export const embedUrl = (p) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(hasPin(p) ? `${num(p.lat)},${num(p.lng)}` : p.location)}&z=${hasPin(p) ? 16 : 13}&output=embed`;

// Reads a pin out of whatever the owner pastes: a Google Maps link, or "12.97, 77.64".
export function parsePin(text) {
  const t = decodeURIComponent(String(text || "").trim());
  if (!t) return null;
  const pats = [/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/, /!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/, /[?&](?:q|ll|query|destination)=(-?\d{1,2}\.\d+)[,+ ]\s*(-?\d{1,3}\.\d+)/, /^\s*(-?\d{1,2}\.\d+)\s*[,; ]\s*(-?\d{1,3}\.\d+)\s*$/];
  for (const re of pats) {
    const m = t.match(re);
    if (m && Math.abs(+m[1]) <= 90 && Math.abs(+m[2]) <= 180) return { lat: +(+m[1]).toFixed(6), lng: +(+m[2]).toFixed(6) };
  }
  return null;
}

let loader;
export function loadGoogleMaps() {
  if (!MAPS_KEY) return Promise.reject(new Error("no-key"));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    window.__slrMapsReady = () => resolve(window.google.maps);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_KEY)}&callback=__slrMapsReady&loading=async&v=weekly`;
    s.async = true;
    s.onerror = () => { loader = null; reject(new Error("load-failed")); };
    document.head.appendChild(s);
  });
  return loader;
}
