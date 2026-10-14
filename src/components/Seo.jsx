import { useEffect } from "react";
import { ROBOTS_INDEX, ROBOTS_NOINDEX } from "../utils/seo.js";
import { SITE } from "../utils/site.js";
import { siteOrigin } from "../utils/boot.js";

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function Seo({ meta }) {
  const sig = JSON.stringify(meta);
  useEffect(() => {
    const origin = siteOrigin();
    const url = origin + (meta.path === "/" ? "/" : meta.path);
    const image = meta.image || origin + SITE.ogImage;
    document.title = meta.title;
    setMeta("name", "description", meta.description);
    setMeta("name", "robots", meta.noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", SITE.name);
    setMeta("property", "og:locale", SITE.locale);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:alt", meta.imageAlt || `${SITE.name} - ${SITE.tagline}`);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
    setMeta("name", "twitter:image", image);

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;

    let ld = document.getElementById("ld-json");
    if (meta.jsonLd?.length) {
      if (!ld) {
        ld = document.createElement("script");
        ld.id = "ld-json";
        ld.type = "application/ld+json";
        document.head.appendChild(ld);
      }
      ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": meta.jsonLd });
    } else ld?.remove();
  }, [sig]);
  return null;
}
