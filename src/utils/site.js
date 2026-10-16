import { EMAIL, INSTAGRAM, CHANNEL, PHONE } from "./contact.js";

export const SITE = {
  name: "SLR PROPERTIES",
  tagline: "Securing Your Space in the Future.",
  country: "IN",
  locale: "en_IN",
  phone: `+${PHONE}`,
  email: EMAIL,
  sameAs: [INSTAGRAM, CHANNEL],
  address: null,
  openingHours: null,
  geo: null,
  ogImage: "/img/og-default.jpg",
};

const HERO_BASE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=70";
export const HERO = {
  src: `${HERO_BASE}&w=1024`,
  srcSet: [640, 1024, 1600, 2000].map((w) => `${HERO_BASE}&w=${w} ${w}w`).join(", "),
  sizes: "100vw",
  alt: `Luxury home exterior - ${SITE.name}`,
};
