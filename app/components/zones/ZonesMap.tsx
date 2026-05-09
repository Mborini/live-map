"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { Zone } from "@/lib/types/zones";

const getColor = (id: number) => {
  const colors = [
    "#10b981",
    "#8b5cf6",
    "#06b6d4",
    "#3b82f6",
    "#f43f5e",
    "#14b8a6",
  ];
  return colors[id % colors.length];
};

export default function ZonesMap({ zones, onMapReady }: any) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [35.9, 31.9],
      zoom: 12,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
    });

    map.addControl(draw);
    map.addControl(new mapboxgl.NavigationControl());

    map.on("load", () => onMapReady(map, draw));

    mapRef.current = map;

    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const render = () => {
      if (!map.isStyleLoaded()) return setTimeout(render, 200);

      if (map.getLayer("zones-fill")) map.removeLayer("zones-fill");
      if (map.getLayer("zones-line")) map.removeLayer("zones-line");
      if (map.getSource("zones")) map.removeSource("zones");

      map.addSource("zones", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: zones.map((z: any) => ({
            type: "Feature",
            geometry:
              typeof z.geometry === "string"
                ? JSON.parse(z.geometry)
                : z.geometry,
            properties: {
              color: getColor(z.id),
            },
          })),
        } as any,
      });

      map.addLayer({
        id: "zones-fill",
        type: "fill",
        source: "zones",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.35,
        },
      });

      map.addLayer({
        id: "zones-line",
        type: "line",
        source: "zones",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2,
        },
      });
    };

    render();
  }, [zones]);

  return <div ref={mapContainer} className="w-full h-full" />;
}