import { SITE } from "./site.js";
import { info, isRent } from "./categories.js";
import { addressOf, areaOf, gallery, isOffMarket, isVideo, isoDate, propertyPath } from "./property.js";
import { hasPin } from "./geo.js";
import { collectionInfo } from "./routes.js";
import { FAQ } from "./faq.js";

export const ROBOTS_INDEX = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
export const ROBOTS_NOINDEX = "noindex,follow";

export function clip(text, max = 155) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return `${cut.slice(0, at > 40 ? at : cut.length).replace(/[\s,.;:\u2013-]+$/, "")}\u2026`;
}

export const withBrand = (t) => (t.length + SITE.name.length + 3 <= 62 ? `${t} | ${SITE.name}` : clip(t, 62));
export const absUrl = (origin, u) => (String(u).startsWith("/") ? origin + u : u);

const AVAILABILITY = {
  Available: "https://schema.org/InStock",
  "Under Offer": "https://schema.org/LimitedAvailability",
  Sold: "https://schema.org/SoldOut",
  Rented: "https://schema.org/OutOfStock",
};

export function orgNode(origin) {
  const n = {
    "@type": "RealEstateAgent",
    "@id": `${origin}/#organization`,
    name: SITE.name,
    url: `${origin}/`,
    slogan: SITE.tagline,
    logo: { "@type": "ImageObject", url: `${origin}/img/icon-512.png`, width: 512, height: 512 },
    image: `${origin}${SITE.ogImage}`,
    telephone: SITE.phone,
    email: SITE.email,
    areaServed: { "@type": "Country", name: "India" },
    contactPoint: [{ "@type": "ContactPoint", telephone: SITE.phone, email: SITE.email, contactType: "sales", areaServed: SITE.country }],
    sameAs: SITE.sameAs,
  };
  if (SITE.address) n.address = { "@type": "PostalAddress", addressCountry: SITE.country, ...SITE.address };
  if (SITE.openingHours) n.openingHours = SITE.openingHours;
  if (SITE.geo) n.geo = { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng };
  return n;
}

export const websiteNode = (origin) => ({
  "@type": "WebSite",
  "@id": `${origin}/#website`,
  url: `${origin}/`,
  name: SITE.name,
  description: "Houses, apartments, villas, plots, land and commercial properties for sale and rent.",
  inLanguage: "en-IN",
  publisher: { "@id": `${origin}/#organization` },
});

export const breadcrumbNode = (origin, items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: origin + path })),
});

export const itemListNode = (origin, list, name) => ({
  "@type": "ItemList",
  name,
  numberOfItems: list.length,
  itemListElement: list.slice(0, 30).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: origin + propertyPath(p), name: p.title })),
});

export const faqNode = () => ({
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

export function listingNode(p, origin) {
  const { g, sub } = info(p.category);
  const rent = isRent(p);
  const url = origin + propertyPath(p);
  const images = gallery(p).filter((u) => !isVideo(u)).map((u) => absUrl(origin, u));
  const residential = g?.id === "residential";
  const sqft = Number(p.sqft) || 0;

  const about = { "@type": residential ? (sub === "Apartments" ? "Apartment" : "House") : "Place", name: p.title, address: addressOf(p, SITE.country) };
  if (hasPin(p)) about.geo = { "@type": "GeoCoordinates", latitude: Number(p.lat), longitude: Number(p.lng) };
  if (residential) {
    if (p.beds > 0) about.numberOfBedrooms = p.beds;
    if (p.baths > 0) about.numberOfBathroomsTotal = p.baths;
    if (sqft > 0) about.floorSize = { "@type": "QuantitativeValue", value: sqft, unitCode: "FTK" };
  } else if (sqft > 0) {
    about.additionalProperty = [{ "@type": "PropertyValue", name: "Area", value: sqft, unitText: "sq ft" }];
  }

  const offer = {
    "@type": "Offer",
    url,
    price: Number(p.price),
    priceCurrency: "INR",
    availability: AVAILABILITY[p.status] || AVAILABILITY.Available,
    seller: { "@id": `${origin}/#organization` },
  };
  if (rent) offer.priceSpecification = { "@type": "UnitPriceSpecification", price: Number(p.price), priceCurrency: "INR", unitCode: "MON" };

  const node = {
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    url,
    name: p.title,
    description: p.description,
    inLanguage: "en-IN",
    datePosted: isoDate(p.created_at),
    dateModified: isoDate(p.updated_at || p.created_at),
    about,
    offers: offer,
    isPartOf: { "@id": `${origin}/#website` },
  };
  if (images.length) node.image = images;
  return node;
}

function propertyMeta(route, origin) {
  const p = route.p;
  const { sub } = info(p.category);
  const rent = isRent(p);
  const area = areaOf(p);
  const { g } = info(p.category);
  const sqft = Number(p.sqft) > 0 ? `${Number(p.sqft).toLocaleString("en-IN")} sq.ft. ` : "";
  const lead = `${isOffMarket(p) ? `${p.status}: ` : ""}${sub} for ${rent ? "rent" : "sale"} in ${p.location}. ${p.price_display}. ${sqft}`;
  const crumbs = [["Home", "/"]];
  if (g) crumbs.push([g.label, `/properties/${g.id}`]);
  crumbs.push([p.title, route.path]);
  const img = gallery(p).find((u) => !isVideo(u));
  return {
    title: withBrand(`${p.title} - ${sub} for ${rent ? "Rent" : "Sale"} in ${area}`),
    description: clip(`${lead}${p.description}`),
    path: route.path,
    image: img ? absUrl(origin, img) : undefined,
    imageAlt: `${p.title}, ${p.location}`,
    jsonLd: [orgNode(origin), breadcrumbNode(origin, crumbs), listingNode(p, origin)],
  };
}

function collectionMeta(route, all, origin) {
  const c = collectionInfo(route, all);
  const n = c.list.length;
  return {
    title: withBrand(c.h1),
    description: clip(`${c.h1}. ${c.intro}`),
    path: route.path,
    noindex: n === 0,
    jsonLd: [orgNode(origin), breadcrumbNode(origin, c.crumbs), ...(n ? [itemListNode(origin, c.list, c.h1)] : [])],
  };
}

const STATIC_META = {
  privacy: { title: "Privacy Policy", description: "How SLR PROPERTIES collects and uses the information you share through its website and enquiry forms." },
  terms: { title: "Terms & Conditions", description: "Terms and conditions for using the SLR PROPERTIES website, property listings and enquiry forms." },
  favorites: { title: "Your Favorite Properties", description: "Properties you have saved on SLR PROPERTIES. Saved on this device only.", noindex: true },
  admin: { title: "Owner Console", description: "Owner console.", noindex: true },
  notfound: { title: "Page not found", description: "The page you are looking for could not be found.", noindex: true },
};

export function metaFor(route, all, origin) {
  switch (route.type) {
    case "home":
      return {
        title: withBrand("Buy, Sell & Rent Properties"),
        description: clip(`Browse houses, apartments, villas, sites, agricultural land, layout plots and commercial rentals. Photos, prices, maps and direct WhatsApp enquiries with ${SITE.name}.`),
        path: "/",
        jsonLd: [orgNode(origin), websiteNode(origin), ...(all.length ? [itemListNode(origin, all, "Available properties")] : []), faqNode()],
      };
    case "property":
      return propertyMeta(route, origin);
    case "collection":
      return collectionMeta(route, all, origin);
    default: {
      const s = STATIC_META[route.type] || STATIC_META.notfound;
      const noindex = !!s.noindex;
      return {
        title: withBrand(s.title),
        description: s.description,
        path: route.path || "/",
        noindex,
        jsonLd: noindex ? [] : [orgNode(origin), breadcrumbNode(origin, [["Home", "/"], [s.title, route.path]])],
      };
    }
  }
}

export const escAttr = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
export const escText = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
export const jsonForScript = (v) => JSON.stringify(v).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

export function headHtml(meta, origin) {
  const url = origin + (meta.path === "/" ? "/" : meta.path);
  const image = meta.image || origin + SITE.ogImage;
  const defaultImg = !meta.image;
  const tags = [
    `<title>${escText(meta.title)}</title>`,
    `<meta name="description" content="${escAttr(meta.description)}">`,
    `<meta name="robots" content="${meta.noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX}">`,
    `<link rel="canonical" href="${escAttr(url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${escAttr(SITE.name)}">`,
    `<meta property="og:locale" content="${SITE.locale}">`,
    `<meta property="og:title" content="${escAttr(meta.title)}">`,
    `<meta property="og:description" content="${escAttr(meta.description)}">`,
    `<meta property="og:url" content="${escAttr(url)}">`,
    `<meta property="og:image" content="${escAttr(image)}">`,
    `<meta property="og:image:alt" content="${escAttr(meta.imageAlt || `${SITE.name} - ${SITE.tagline}`)}">`,
    ...(defaultImg ? [`<meta property="og:image:width" content="1200">`, `<meta property="og:image:height" content="630">`] : []),
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escAttr(meta.title)}">`,
    `<meta name="twitter:description" content="${escAttr(meta.description)}">`,
    `<meta name="twitter:image" content="${escAttr(image)}">`,
  ];
  if (meta.jsonLd?.length) {
    tags.push(`<script type="application/ld+json" id="ld-json">${jsonForScript({ "@context": "https://schema.org", "@graph": meta.jsonLd })}</script>`);
  }
  return tags.join("\n");
}
