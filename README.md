# SLR PROPERTIES — React (JSX) + Vite on Cloudflare Pages + D1 + R2

*"Securing Your Space in the Future."*

Public site (`/`), owner console (`/admin`), photos/videos in **R2**, listings and enquiries in **D1**.

```
SLR/
├── index.html  package.json  vite.config.js
├── public/                 # logo.jpg, robots.txt, _routes.json (only /api/* runs the function)
├── src/
│   ├── main.jsx            # picks site or /admin
│   ├── App.jsx             # routes: /, /property/:slug-id, /favorites
│   ├── components/         # Navbar, Hero, Browse, FilterBar, Listings, PropertyCard, Gallery, EmiCalculator,
│   │                       # ContactForm, EnquiryModal, WhatsAppButton, Why, Process, Faq, ContactSection,
│   │                       # Footer, Floating, Layout, Seo
│   ├── pages/              # Home, PropertyDetails, Favorites, NotFound, Admin
│   ├── context/            # AppContext (listings, filters, favorites, enquiry modal)
│   ├── utils/              # api, contact (phone/email/WhatsApp), categories, property, filters, format, router
│   ├── styles/             # styles.css, pages.css, admin.css
│   └── assets/             # logo.jpg
├── functions/api/[[path]].js   # backend API (D1 + R2)
└── schema.sql
```

## v5 additions
Advanced search (sale/rent, type, location, min/max budget) · property detail pages at `/property/<slug>-<id>` with gallery, specifications, highlights (taken only from the listing description), EMI, call/email/WhatsApp/enquiry form · per-property WhatsApp enquiry (prefilled message) · Favorites page (saved on the device) · enquiry form on the home page · per-page titles, descriptions, canonical/Open Graph tags, JSON-LD and robots.txt. Old `/#property-12` links redirect to the new pages.

## What was new in v4
**Website:** Buy / Rent switch with matching budget ranges · sort (featured, newest, price, area) · saved properties (heart, kept on the visitor's device) · shareable property links (`/#property-12`) · gallery with arrows and keyboard · price per sq.ft and a home-loan EMI estimator on sale listings · similar properties · Sold / Under Offer / Rented status on cards · live listing counts · How it works and FAQ sections · back-to-top button.

**Admin:** sign-in, stats (inventory value, enquiries in last 7 days) · search · **edit listings** · change status and toggle Featured from the table · display price auto-filled from the numeric price · remove single gallery items · delete and export enquiries to CSV.

**API additions:** `PUT /api/admin/properties/{id}` (also cleans up replaced R2 files), `DELETE /api/admin/inquiries/{id}`, statuses `Available / Under Offer / Sold / Rented`.

## Deploy (browser only)
1. Upload the **contents** of this folder to a GitHub repository.
2. Cloudflare → **Storage & Databases → D1** → create `slr-properties-db`.
3. **R2 Object Storage** → create bucket `slr-properties-images`.
4. **Workers & Pages → Create → Pages → Connect to Git**, then:
   - Framework preset: **None** (or Vite)
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Project → **Settings → Bindings**: D1 `DB` → `slr-properties-db`; R2 `BUCKET` → `slr-properties-images`.
6. **Variables and Secrets** (see "Owner login by email code" and "Google Map" below).
7. **Deployments → Retry deployment**. Tables and six sample listings are created on first visit. Sign in at `/admin`.

## Run locally
```
npm install
npm run dev        # UI only; /api is proxied to http://localhost:8788
```
For the full stack locally, run `npm run build` then `npx wrangler pages dev dist` with D1/R2 bindings.

## API
| Method | Endpoint | Auth |
| --- | --- | --- |
| GET | `/api/properties`, `/api/properties/{id}`, `/api/images/{key}` | – |
| POST | `/api/inquiries` | – |
| POST | `/api/admin/login` | credentials |
| POST / PUT / DELETE | `/api/admin/properties[/{id}]` | admin token |
| POST | `/api/admin/upload` | admin token |
| GET / DELETE | `/api/admin/inquiries[/{id}]` | admin token |

Uploads: images up to 10 MB, videos (MP4/WEBM/MOV) up to 50 MB.


## Owner login by email code (OTP)
The owner enters their email at `/admin`, gets a 6-digit code (valid 5 minutes, one use), and is signed in for 12 hours. Only `OWNER_EMAIL` ever receives a code. 5 wrong tries burn the code, one request per minute, 5 per hour.

1. Create a free account at **resend.com**, add and verify your domain (adds a few DNS records in Cloudflare), and create an **API key**.
   *Quick test without a domain:* use `RESEND_FROM = onboarding@resend.dev`; Resend then only delivers to the email you signed up with, so set `OWNER_EMAIL` to that.
2. Cloudflare → Pages project → **Settings → Variables and Secrets**, add:

| Name | Type | Example |
| --- | --- | --- |
| `OWNER_EMAIL` | Text | owner@yourdomain.com |
| `RESEND_API_KEY` | Secret | re_xxxxxxxx |
| `RESEND_FROM` | Text | SLR Properties <login@yourdomain.com> |
| `SESSION_SECRET` | Secret | any long random text |

3. Redeploy. The password form disappears. To keep the old password as a backup, leave `ADMIN_USERNAME` / `ADMIN_PASSWORD` set and add `ALLOW_PASSWORD_LOGIN = true`. If the OTP variables are missing, the site falls back to the password form so you are never locked out.

## Google Map
- **Browse page:** a List / Map switch above the listings. Pins follow the category / buy-rent / budget filters; tapping a pin shows photo, price, *View details* and *Directions*. The old Location dropdown is removed.
- **Property page:** a Location section with the map and *Get directions* / *Open in Google Maps*.
- **Owner console:** each listing has an optional *Map location* field. Paste a Google Maps link (or `12.9784, 77.6408`) to set the exact pin. Without it the pin sits at the centre of the area (marked "Approximate area").

Setup:
1. Google Cloud Console → create a project → enable **Maps JavaScript API** → create an **API key**.
2. Restrict the key: *HTTP referrers* = your site domain(s); *API restrictions* = Maps JavaScript API only.
3. Cloudflare Pages → **Settings → Variables and Secrets** → add `VITE_GOOGLE_MAPS_KEY` (Text) as a **build** variable, then redeploy (it is baked in at build time; a browser key is public by design, so the referrer restriction is what protects it).

Existing databases get the new `lat` / `lng` columns and the `login_otps` table automatically on the first request.
