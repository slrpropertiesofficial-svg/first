import { useEffect, useRef, useState } from "react";
import { BENGALURU, MAPS_KEY, directionsUrl, loadGoogleMaps, pointOf } from "../utils/geo.js";
import { propertyPath, safeUrl, isVideo } from "../utils/property.js";
import { navigate } from "../utils/router.jsx";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Google Map with one pin per listing. Tapping a pin opens a small card.
export default function MapView({ list }) {
  const box = useRef(null);
  const map = useRef(null);
  const pins = useRef([]);
  const win = useRef(null);
  const [status, setStatus] = useState(MAPS_KEY ? "loading" : "nokey"); // loading | ready | nokey | error

  useEffect(() => {
    if (!MAPS_KEY) return;
    let dead = false;
    loadGoogleMaps().then((maps) => {
      if (dead || !box.current) return;
      map.current = new maps.Map(box.current, {
        center: BENGALURU, zoom: 11, mapTypeControl: false, streetViewControl: false, fullscreenControl: true, gestureHandling: "greedy",
      });
      win.current = new maps.InfoWindow({ maxWidth: 260 });
      setStatus("ready");
    }).catch(() => !dead && setStatus("error"));
    return () => { dead = true; };
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    const maps = window.google.maps;
    pins.current.forEach((m) => m.setMap(null));
    pins.current = [];
    const bounds = new maps.LatLngBounds();

    list.forEach((p) => {
      const pt = pointOf(p);
      if (!pt) return;
      const off = p.status && p.status !== "Available";
      const m = new maps.Marker({
        map: map.current, position: pt, title: p.title,
        icon: { path: maps.SymbolPath.CIRCLE, scale: 11, fillColor: off ? "#7c8396" : "#1f3358", fillOpacity: 1, strokeColor: "#f8f4ea", strokeWeight: 3 },
      });
      m.addListener("click", () => {
        const img = !isVideo(p.image_url) && safeUrl(p.image_url);
        const html = `<div class="mp">${img ? `<img src="${esc(img)}" alt="">` : ""}
          <b>${esc(p.title)}</b><span>${esc(p.location)}</span>
          <strong>${esc(p.price_display)}</strong>
          ${pt.exact ? "" : `<em>Approximate area</em>`}
          <div class="mp-a"><a href="${esc(propertyPath(p))}" data-go="${esc(propertyPath(p))}">View details</a>
          <a href="${esc(directionsUrl(p))}" target="_blank" rel="noopener">Directions</a></div></div>`;
        win.current.setContent(html);
        win.current.open({ map: map.current, anchor: m });
      });
      pins.current.push(m);
      bounds.extend(pt);
    });

    if (pins.current.length > 1) map.current.fitBounds(bounds, 56);
    else if (pins.current.length === 1) { map.current.setCenter(bounds.getCenter()); map.current.setZoom(14); }
    else { map.current.setCenter(BENGALURU); map.current.setZoom(11); }
    win.current?.close();
  }, [list, status]);

  // "View details" inside the info card should stay inside the single-page app
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

  if (status === "nokey") return (
    <div className="map-note"><i className="fa-solid fa-map-location-dot" />
      <h3>Map is almost ready</h3>
      <p>Add the Google Maps key (<code>VITE_GOOGLE_MAPS_KEY</code>) in Cloudflare and redeploy to show the pins.</p></div>
  );
  if (status === "error") return (
    <div className="map-note"><i className="fa-solid fa-triangle-exclamation" />
      <h3>The map could not load</h3>
      <p>Check the Google Maps key and that “Maps JavaScript API” is enabled, then refresh.</p></div>
  );
  const shown = list.filter((p) => pointOf(p)).length;
  return (
    <div className="map-wrap">
      <div ref={box} className="map" role="region" aria-label="Map of available properties" />
      {status === "loading" && <div className="map-load">Loading map…</div>}
      {status === "ready" && <p className="map-count">{shown} {shown === 1 ? "pin" : "pins"} on the map</p>}
    </div>
  );
}

