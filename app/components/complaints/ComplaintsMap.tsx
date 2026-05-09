"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import { Complaint } from "@/lib/types/complaint";
import { ComplaintPopup } from "./ComplaintPopup";
import { ComplaintPopupRoot } from "./ComplaintPopupRoot";

const statusColorByName: Record<string, string> = {
  new: "red",
  in_progress: "orange",
  closed: "green",
};

export default function ComplaintsMap({
  complaints,
  focused,
  onSelect,
}: {
  complaints: Complaint[];
  focused: Complaint | null;
  onSelect: (c: Complaint) => void;
}) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const focusMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // ===== Create map =====
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken =
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [35.9, 31.9],
      zoom: 12,
    });

    map.addControl(new mapboxgl.NavigationControl());
    mapRef.current = map;

    return () => {
      focusMarkerRef.current?.remove();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
    };
  }, []);

  // ===== All markers =====
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    complaints.forEach((c) => {
      if (!c.lng || !c.lat) return;

      const lng = Number(c.lng);
      const lat = Number(c.lat);
      if (Number.isNaN(lng) || Number.isNaN(lat)) return;

      const el = document.createElement("div");
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.borderRadius = "50%";
      el.style.background =
        statusColorByName[(c as any).status_name ?? "new"];
      el.style.border = "2px solid red";
      el.style.boxShadow = "0 6px 14px rgba(0,0,0,0.25)";
      el.style.cursor = "pointer";


const popupContainer = document.createElement("div");
createRoot(popupContainer).render(
  <ComplaintPopupRoot complaint={c} />
);
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({
            offset: 20,
            closeButton: false,
            className: "mantine-mapbox-popup",
          }).setDOMContent(popupContainer)
        )
        .addTo(map);

      marker.getElement().addEventListener("click", () => {
        onSelect(c);
        marker.togglePopup();
      });

      markersRef.current.push(marker);
    });
  }, [complaints, onSelect]);

  // ===== Focused marker =====
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!focused?.lng || !focused?.lat) {
      focusMarkerRef.current?.remove();
      focusMarkerRef.current = null;
      return;
    }

    const lng = Number(focused.lng);
    const lat = Number(focused.lat);
    if (Number.isNaN(lng) || Number.isNaN(lat)) return;

    focusMarkerRef.current?.remove();

    const pin = document.createElement("div");
    pin.style.width = "22px";
    pin.style.height = "22px";
    pin.style.borderRadius = "50%";
    pin.style.background = "#ef4444";
    pin.style.border = "3px solid white";
    pin.style.boxShadow = "0 8px 20px rgba(0,0,0,0.35)";

 const popupContainer = document.createElement("div");

createRoot(popupContainer).render(
  <ComplaintPopupRoot complaint={focused} />
);

    const marker = new mapboxgl.Marker(pin)
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({
          offset: 26,
          closeButton: false,
          className: "mantine-mapbox-popup",
        }).setDOMContent(popupContainer)
      )
      .addTo(map);

    focusMarkerRef.current = marker;

    map.flyTo({
      center: [lng, lat],
      zoom: 16,
      duration: 900,
    });

    marker.togglePopup();
  }, [focused]);

  return <div ref={mapContainer} className="w-full h-full" />;
}