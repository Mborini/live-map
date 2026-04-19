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

  const watchId = useRef<number | null>(null);
  const hasStartedGPS = useRef(false);

  const [mapStyle, setMapStyle] = useState(0);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

    // ✅ RTL (مرة واحدة فقط globally)
    initRTL();

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: styles[mapStyle],
      center: [35.9, 31.9],
      zoom: 14,
    });

    mapInstance.current = map;
    mapRef.current = map;

    // 🧭 Controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "top-right"
    );

    map.on("load", () => {
      // 🔍 Geocoder Search
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

      // 📍 Marker
      const el = document.createElement("div");
      el.style.width = "16px";
      el.style.height = "16px";
      el.style.borderRadius = "50%";
      el.style.background = "#2a9df4";
      el.style.border = "3px solid white";

      markerRef.current = new mapboxgl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([35.9, 31.9])
        .addTo(map);

      startGPS();
    });

    const startGPS = () => {
      if (hasStartedGPS.current) return;
      hasStartedGPS.current = true;

      if (!navigator.geolocation) return;

      watchId.current = navigator.geolocation.watchPosition((pos) => {
        const newPos: [number, number] = [
          pos.coords.longitude,
          pos.coords.latitude,
        ];

        markerRef.current?.setLngLat(newPos);

        mapInstance.current?.jumpTo({
          center: newPos,
          zoom: 16,
        });
      });
    };

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
      map.remove();
    };
  }, []);

  // 🔁 Switch Map Style
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
      {/* 🔍 Search Box */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[320px]">
        <div ref={geocoderContainer} />
      </div>

      {/* 🗺️ Map */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* 🎛️ Controls */}
      <MapStyleSwitcher
        currentStyleIndex={mapStyle}
        onSwitch={switchMapStyle}
      />

      <KmlButton mapRef={mapRef} />
    </div>
  );
}