let loader;

export function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (!loader) {
    loader = Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")])
      .then(([mod]) => window.L || mod.default || mod)
      .catch((e) => { loader = null; throw e; });
  }
  return loader;
}
