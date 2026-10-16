const num = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v));
export const hasPin = (p) => Number.isFinite(num(p.lat)) && Number.isFinite(num(p.lng));

export const pointOf = (p) => (hasPin(p) ? { lat: num(p.lat), lng: num(p.lng) } : null);

export const directionsUrl = (p) => {
  const pt = hasPin(p) ? `${num(p.lat)},${num(p.lng)}` : `${p.title}, ${p.location}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pt)}`;
};
export const openMapUrl = (p) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hasPin(p) ? `${num(p.lat)},${num(p.lng)}` : `${p.title}, ${p.location}`)}`;

export const embedUrl = (p) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(hasPin(p) ? `${num(p.lat)},${num(p.lng)}` : p.location)}&z=${hasPin(p) ? 16 : 13}&output=embed`;

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
