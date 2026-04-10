"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import KmlButton from "./KmlButton";

export default function LiveMap({ mapRef }: any) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const geocoderContainer = useRef<HTMLDivElement | null>(null);

  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const watchId = useRef<number | null>(null);
  const hasStartedGPS = useRef(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [35.9, 31.9],
      zoom: 14,
    });

    mapInstance.current = map;
    mapRef.current = map;

    // 🧭 أدوات الزاوية
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "top-right"
    );

    // 🔍 Search (center UI)
    map.on("load", () => {
      if (geocoderContainer.current) {
        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken!,
          mapboxgl: mapboxgl as any,
          marker: false,
          placeholder: "ابحث عن مكان...",
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
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      map.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      {/* 🔍 Search Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[320px]">
        <div ref={geocoderContainer} />
      </div>

      {/* 🗺️ Map */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* 🟦 KML Button */}
      <KmlButton mapRef={mapRef} />
    </div>
  );
}