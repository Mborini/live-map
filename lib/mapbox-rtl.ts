import mapboxgl from "mapbox-gl";

let initialized = false;

export function initRTL() {
  if (initialized || typeof window === "undefined") return;

  mapboxgl.setRTLTextPlugin(
    "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
    null,
    true
  );

  initialized = true;
}