async function call(url, opts = {}) {
  const res = await fetch(url, opts);
  let data = {};
  try { data = await res.json(); } catch { /* non-JSON */ }
  return { ok: res.ok && data.status === "success", code: res.status, data };
}
const json = (method, body, token) => ({
  method,
  headers: { "Content-Type": "application/json", ...(token ? { "X-Admin-Password": token } : {}) },
  body: body ? JSON.stringify(body) : undefined,
});
const auth = (token, method = "GET") => ({ method, headers: { "X-Admin-Password": token } });

export const api = {
  properties: () => call("/api/properties"),
  inquiry: (b) => call("/api/inquiries", json("POST", b)),
  login: (username, password) => call("/api/admin/login", json("POST", { username, password })),
  adminInquiries: (t) => call("/api/admin/inquiries", auth(t)),
  createProperty: (b, t) => call("/api/admin/properties", json("POST", b, t)),
  updateProperty: (id, b, t) => call(`/api/admin/properties/${id}`, json("PUT", b, t)),
  deleteProperty: (id, t) => call(`/api/admin/properties/${id}`, auth(t, "DELETE")),
  deleteInquiry: (id, t) => call(`/api/admin/inquiries/${id}`, auth(t, "DELETE")),
  upload: (file, t) => call("/api/admin/upload", { method: "POST", headers: { "X-Admin-Password": t, "Content-Type": file.type }, body: file }),
};
