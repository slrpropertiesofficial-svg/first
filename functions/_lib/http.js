export const siteOrigin = (env, url) => {
  try { return env.SITE_URL ? new URL(env.SITE_URL).origin : url.origin; } catch { return url.origin; }
};

export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src https://maps.google.com https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

export const SECURITY_HEADERS = {
  "Content-Security-Policy": CSP,
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=31536000",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
};

export const redirect = (to, status = 301) => new Response(null, { status, headers: { Location: to, "Cache-Control": "public, max-age=3600" } });
