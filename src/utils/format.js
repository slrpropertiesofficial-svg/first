export const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

// 18500000 -> "₹1.85 Cr", 6800000 -> "₹68 Lakhs", 120000 rent -> "₹1.20 Lakh / Mo"
export function priceLabel(n, rent = false) {
  n = Number(n) || 0;
  const trim = (v) => String(+v.toFixed(2));
  let s;
  if (n >= 1e7) s = `₹${trim(n / 1e7)} Cr`;
  else if (n >= 1e5) s = `₹${trim(n / 1e5)} ${rent ? "Lakh" : "Lakhs"}`;
  else s = inr(n);
  return rent ? `${s} / Mo` : s;
}

export function emi(principal, annualRate, years) {
  const r = annualRate / 12 / 100, n = years * 12;
  if (principal <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
