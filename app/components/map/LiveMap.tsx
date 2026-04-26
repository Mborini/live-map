"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import KmlButton from "./KmlButton";
import MapStyleSwitcher from "./MapStyleSwitcher";
import { initRTL } from "@/lib/mapbox-rtl";

const styles = [
  "mapbox://styles/mapbox/streets-v11",
  "mapbox://styles/mapbox/satellite-v9",
  "mapbox://styles/mapbox/outdoors-v11",
];

export default function LiveMap({ mapRef }: any) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const geocoderContainer = useRef<HTMLDivElement | null>(null);

  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const geolocateRef = useRef<mapboxgl.GeolocateControl | null>(null);

  const lastLngLat = useRef<[number, number] | null>(null);
  const isAutoFollow = useRef(true);

  const [mapStyle, setMapStyle] = useState(0);

  /* ---------------- Smooth marker animation ---------------- */
  function smoothMove(
    marker: mapboxgl.Marker,
    from: [number, number],
    to: [number, number],
    duration = 600
  ) {
    const start = performance.now();

    function animate(time: number) {
      const t = Math.min((time - start) / duration, 1);

      const lng = from[0] + (to[0] - from[0]) * t;
      const lat = from[1] + (to[1] - from[1]) * t;

      marker.setLngLat([lng, lat]);

      if (t < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  /* ---------------- Init Map ---------------- */
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;
    initRTL();

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: styles[mapStyle],
      center: [35.9, 31.9], // fallback
      zoom: 14,
    });

    mapInstance.current = map;
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    /* ------ Stop auto-follow on user interaction ------ */
    map.on("dragstart", () => (isAutoFollow.current = false));
    map.on("zoomstart", () => (isAutoFollow.current = false));
    map.on("rotatestart", () => (isAutoFollow.current = false));
    map.on("pitchstart", () => (isAutoFollow.current = false));

    /* -------- Custom Marker -------- */
    const el = document.createElement("div");
    el.style.width = "16px";
    el.style.height = "16px";
    el.style.borderRadius = "50%";
    el.style.background = "#2a9df4";
    el.style.border = "3px solid white";

    const marker = new mapboxgl.Marker({ element: el });
    markerRef.current = marker;

    /* -------- Geolocate -------- */
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });

    geolocate.on("geolocate", (e) => {
      const lngLat: [number, number] = [
        e.coords.longitude,
        e.coords.latitude,
      ];

      // First fix
      if (!lastLngLat.current) {
        marker.setLngLat(lngLat).addTo(map);
        map.easeTo({ center: lngLat, zoom: 16, duration: 0 });
        lastLngLat.current = lngLat;
        return;
      }

      // Always move marker smoothly
      smoothMove(marker, lastLngLat.current, lngLat);

      // Move map ONLY if auto-follow is enabled
      if (isAutoFollow.current) {
        map.easeTo({
          center: lngLat,
          duration: 800,
          easing: (t) => t,
        });
      }

      lastLngLat.current = lngLat;
    });

    // When user presses location button → re-enable follow
    geolocate.on("trackuserlocationstart", () => {
      isAutoFollow.current = true;
    });

    map.addControl(geolocate, "top-right");
    geolocateRef.current = geolocate;

    /* -------- On Load -------- */
    map.on("load", () => {
      if (geocoderContainer.current) {
        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken!,
          mapboxgl: mapboxgl as any,
          marker: false,
          placeholder: "ابحث عن مكان...",
          language: "ar",
        });

        geocoderContainer.current.appendChild(geocoder.onAdd(map));
      }

      geolocate.trigger();
    });

    return () => map.remove();
  }, []);

  /* ---------------- Switch Map Style ---------------- */
  const switchMapStyle = () => {
    const next = (mapStyle + 1) % styles.length;
    setMapStyle(next);

    const map = mapInstance.current;
    if (!map) return;

    map.setStyle(styles[next]);
    map.once("style.load", () => {
      markerRef.current?.addTo(map);
    });
  };

  return (
    <div className="relative w-full h-screen">
      {/* Search */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[320px]">
        <div ref={geocoderContainer} />
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Controls */}
      <MapStyleSwitcher
        currentStyleIndex={mapStyle}
        onSwitch={switchMapStyle}
      />

      <KmlButton mapRef={mapRef} />
    </div>
  );
}
``