import { useEffect, useRef, useState } from "react";
import { directionsUrl, pointOf } from "../utils/geo.js";
import { loadLeaflet } from "../utils/leaflet.js";
import { propertyPath, safeUrl, isVideo } from "../utils/property.js";
import { navigate } from "../utils/router.jsx";

const DEFAULT_VIEW = { center: [22.5, 79], zoom: 4 };

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default function MapView({ list }) {
  const box = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let dead = false;
    loadLeaflet().then((L) => {
      if (dead || !box.current) return;
      map.current = L.map(box.current, { scrollWheelZoom: false }).setView(DEFAULT_VIEW.center, DEFAULT_VIEW.zoom);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      }).addTo(map.current);
      layer.current = L.layerGroup().addTo(map.current);
      setStatus("ready");
    }).catch(() => !dead && setStatus("error"));
    return () => { dead = true; map.current?.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    const L = window.L;
    layer.current.clearLayers();
    const pts = [];
    list.forEach((p) => {
      const pt = pointOf(p);
      if (!pt) return;
      const off = p.status && p.status !== "Available";
      const img = !isVideo(p.image_url) && safeUrl(p.image_url);
      const html = `<div class="mp">${img ? `<img src="${esc(img)}" alt="">` : ""}
        <b>${esc(p.title)}</b><span>${esc(p.location)}</span><strong>${esc(p.price_display)}</strong>
        <div class="mp-a"><a href="${esc(propertyPath(p))}" data-go="${esc(propertyPath(p))}">View details</a>
        <a href="${esc(directionsUrl(p))}" target="_blank" rel="noopener">Directions</a></div></div>`;
      L.circleMarker([pt.lat, pt.lng], {
        radius: 11, weight: 3, color: "#f8f4ea", fillColor: off ? "#7c8396" : "#1f3358", fillOpacity: 1,
      }).bindPopup(html, { maxWidth: 260 }).addTo(layer.current);
      pts.push([pt.lat, pt.lng]);
    });
    map.current.closePopup();
    if (pts.length > 1) map.current.fitBounds(pts, { padding: [48, 48], maxZoom: 15 });
    else if (pts.length === 1) map.current.setView(pts[0], 14);
    else map.current.setView(DEFAULT_VIEW.center, DEFAULT_VIEW.zoom);
    setTimeout(() => map.current?.invalidateSize(), 50);
  }, [list, status]);

  useEffect(() => {
    const el = box.current;
    const h = (e) => {
      const a = e.target.closest?.("a[data-go]");
      if (!a || e.metaKey || e.ctrlKey) return;
      e.preventDefault(); navigate(a.dataset.go);
    };
    el?.addEventListener("click", h);
    return () => el?.removeEventListener("click", h);
  }, []);

  const shown = list.filter((p) => pointOf(p)).length;
  return (
    <div className="map-wrap">
      <div ref={box} className="map" role="region" aria-label="Map of available properties" />
      {status === "loading" && <div className="map-load">Loading map…</div>}
      {status === "error" && (
        <div className="map-load"><span><i className="fa-solid fa-triangle-exclamation" /> The map could not load. Check your internet connection and refresh.</span></div>
      )}
      {status === "ready" && <p className="map-count">{shown} {shown === 1 ? "pin" : "pins"} on the map</p>}
    </div>
  );
}
