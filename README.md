# SLR PROPERTIES

React + Vite on Cloudflare Pages, with Pages Functions, D1 (listings and enquiries) and R2 (photos and videos).
Public site at `/`, owner console at `/admin`.

## Structure

```
index.html                 static shell with fonts preloaded and default meta
public/                    _headers, _routes.json, manifest, favicons, /img, /fonts
functions/
  [[path]].js              edge renderer: head tags, JSON-LD, HTML snapshot, redirects, 404s, robots, sitemap, llms.txt
  api/[[path]].js          backend API (D1 + R2)
  _lib/                    db, feeds, snapshot, cache, http, indexnow
src/
  utils/                   routes, seo, site, property, filters, format (shared by browser and edge)
  pages/ components/       Home, Collection, PropertyDetails, Favorites, Admin, ...
```

## Deploy

1. Push this folder to a GitHub repository.
2. Cloudflare: create a D1 database and an R2 bucket.
3. Workers & Pages: create a Pages project from the repository. Build command `npm run build`, output directory `dist`.
4. Project Settings, Bindings: D1 as `DB`, R2 as `BUCKET`.
5. Project Settings, Variables and Secrets: see below.
6. Deploy. Tables and sample listings are created on the first visit.

### Variables

| Name | Purpose |
| --- | --- |
| `SITE_URL` | Your canonical address, for example `https://www.example.com`. Canonical tags, the sitemap and robots.txt use it, and requests on any other host (such as `*.pages.dev`) get a 301 to it. Set this. |
| `INDEXNOW_KEY` | Optional. 8 to 128 letters, digits or dashes. Enables instant Bing, Yandex and Naver notification whenever a listing changes. |
| `OWNER_EMAIL`, `RESEND_API_KEY`, `RESEND_FROM`, `SESSION_SECRET` | Owner sign-in by email code. |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ALLOW_PASSWORD_LOGIN` | Optional password sign-in. Used as the fallback when the email variables are missing. |

## Run locally

```
npm install
npm run dev
npm run preview:edge
```

`npm run dev` serves the UI only and proxies `/api` to port 8788. `npm run preview:edge` builds and runs the full stack, including the edge renderer, under Wrangler. Add `--d1 DB=slr --r2 BUCKET=slr` for local bindings.

## SEO

### How it works
Every HTML request passes through `functions/[[path]].js`, which reads the listings (cached for two minutes) and returns the app shell with:

- a unique title, meta description, canonical, robots, Open Graph and Twitter tags for the route
- JSON-LD: RealEstateAgent, WebSite, BreadcrumbList, ItemList, FAQPage and RealEstateListing with offer, availability, address, floor size and coordinates
- a real HTML snapshot of the page inside `#root` (headings, listings, links, FAQ) for crawlers that do not run JavaScript; React replaces it on load
- the listing data embedded as JSON, so the browser does not wait for an API call
- correct status codes: unknown URLs return 404, old or wrong property slugs 301 to the current one, trailing slashes 301 away

### Crawlable pages
`/properties`, `/properties/{residential|land|commercial}`, `/properties/{group}/{type}` and `/locations/{area}`. Locations appear automatically from listing data. A page with no listings stays reachable but is `noindex` and left out of the sitemap until a listing exists.

### Feeds
`/sitemap.xml` (lastmod and image entries), `/robots.txt` (allows `/api/images/` so uploaded photos can be indexed), `/llms.txt`.

### Performance
Fonts and icons are self-hosted with `font-display: swap` and metric-matched fallbacks, the hero is a preloaded responsive image, logos are WebP, Leaflet loads only when a map opens, hashed assets are cached for a year, and security headers (CSP, HSTS, nosniff, referrer and permissions policy) are set on every page.

### After deploying
1. Set `SITE_URL`, then add the site to Google Search Console and Bing Webmaster Tools and submit `/sitemap.xml`.
2. Fill in `address`, `openingHours` and `geo` in `src/utils/site.js` once you have a street address. Claim a Google Business Profile with the same name, address and phone.
3. Add `www` to apex (or the reverse) redirect in Cloudflare so only one host exists.
4. Check pages with the Rich Results Test and PageSpeed Insights.
5. Write a meaningful description for each listing; it feeds the title, snippet and structured data.

## API

| Method | Endpoint | Auth |
| --- | --- | --- |
| GET | `/api/properties`, `/api/properties/{id}`, `/api/images/{key}` | none |
| POST | `/api/inquiries` | none |
| POST | `/api/admin/login`, `/api/admin/otp/request`, `/api/admin/otp/verify` | credentials |
| POST, PUT, DELETE | `/api/admin/properties[/{id}]` | admin token |
| POST | `/api/admin/upload` | admin token |
| GET, DELETE | `/api/admin/inquiries[/{id}]` | admin token |

Uploads: images up to 10 MB, videos (MP4, WEBM, MOV) up to 50 MB.

## Owner sign-in by email code

The owner enters their email at `/admin` and receives a 6-digit code valid for 5 minutes and one use. Only `OWNER_EMAIL` ever receives a code. Five wrong tries burn the code, with one request per minute and five per hour.

1. Create a Resend account, verify your domain and create an API key. For a quick test use `RESEND_FROM = onboarding@resend.dev` with `OWNER_EMAIL` set to the email you signed up with.
2. Add `OWNER_EMAIL`, `RESEND_API_KEY`, `RESEND_FROM` and `SESSION_SECRET` in Cloudflare and redeploy.
3. To keep the password as a backup, leave `ADMIN_USERNAME` and `ADMIN_PASSWORD` set and add `ALLOW_PASSWORD_LOGIN = true`.

## Maps

OpenStreetMap through Leaflet, bundled with the site. No API key or billing. Each listing has an optional map location in the owner console (paste a Google Maps link or `12.9784, 77.6408`). Without it the listing is simply left off the overview map.
