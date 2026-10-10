import { useEffect } from "react";

const SITE = "SLR PROPERTIES";
function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute("content", content);
}

// Sets title, description, canonical, social tags and optional JSON-LD for the current page.
export default function Seo({ title, description, image, path = location.pathname, noindex = false, jsonLd }) {
  useEffect(() => {
    const full = title ? `${title} | ${SITE}` : `${SITE} | Securing Your Space in the Future.`;
    const url = location.origin + path;
    document.title = full;
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex,follow" : "index,follow");
    setMeta("property", "og:title", full);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", url);
    setMeta("property", "og:site_name", SITE);
    setMeta("property", "og:image", image || `${location.origin}/logo.jpg`);
    setMeta("name", "twitter:card", "summary_large_image");
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = url;
    let ld = document.getElementById("ld-json");
    if (jsonLd) {
      if (!ld) { ld = document.createElement("script"); ld.id = "ld-json"; ld.type = "application/ld+json"; document.head.appendChild(ld); }
      ld.textContent = JSON.stringify(jsonLd);
    } else ld?.remove();
  }, [title, description, image, path, noindex, jsonLd]);
  return null;
}
