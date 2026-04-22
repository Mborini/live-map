"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Complaint } from "@/lib/types/complaint";

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

  // إنشاء الخريطة
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

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

  // Markers + popup
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const focusedId = focused?.id ?? null;

    complaints.forEach((c) => {
      if (!c.lng || !c.lat) return;

      const lng = Number(c.lng);
      const lat = Number(c.lat);
      if (Number.isNaN(lng) || Number.isNaN(lat)) return;

      const isSelected = focusedId === c.id;

      const el = document.createElement("div");
      el.style.width = isSelected ? "18px" : "14px";
      el.style.height = isSelected ? "18px" : "14px";
      el.style.borderRadius = "50%";

      const status = (c as any).status_name ?? "new";
      el.style.background = statusColorByName[status] ?? "green";
      el.style.border = isSelected ? "3px solid #228be6" : "2px solid white";
      el.style.boxShadow = "0 6px 14px rgba(0,0,0,0.25)";
      el.style.cursor = "pointer";

      const title =
        (c as any).type_name
          ? `${(c as any).type_name}${
              (c as any).sub_type_name ? " - " + (c as any).sub_type_name : ""
            }`
          : "Complaint";

      const popupHtml = `
        <div class="complaint-popup">
          <div class="popup-header">
            <span class="popup-title">${title}</span>
            <span class="popup-status ${status}">
              ${status.replace("_", " ")}
            </span>
          </div>
          <div class="popup-body">
            ${(c as any).description ?? "لا يوجد وصف"}
          </div>
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({
            offset: 18,
            className: "complaint-mapbox-popup",
            closeButton: false,
          }).setHTML(popupHtml)
        )
        .addTo(map);

      marker.getElement().addEventListener("click", () => {
        onSelect(c);
        marker.togglePopup();
      });

      markersRef.current.push(marker);
    });
  }, [complaints, focused?.id, onSelect]);

  // Focused marker + flyTo
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
    pin.className = "focused-pin";

    const title =
      (focused as any).type_name ??
      "Complaint";

    const popupHtml = `
      <div class="complaint-popup">
        <div class="popup-header">
          <span class="popup-title">📌 ${title}</span>
        </div>
        <div class="popup-body">
          ${(focused as any).description ?? "لا يوجد وصف"}
        </div>
      </div>
    `;

    const marker = new mapboxgl.Marker(pin)
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({
          offset: 24,
          className: "complaint-mapbox-popup",
          closeButton: false,
        }).setHTML(popupHtml)
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