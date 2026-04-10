"use client";

import { useState } from "react";
import { parseKmlToGeoJSON } from "../utils/kmlUtils";

type Props = {
  mapRef: any;
};

export default function KmlButton({ mapRef }: Props) {
  const [active, setActive] = useState(false);

  const sourceId = "kml-source";
  const iconId = "bin-icon";

  const toggleKml = async () => {
    const map = mapRef.current;
    if (!map) return;

    // 🧹 REMOVE IF ACTIVE
    if (active) {
      ["kml-line", "kml-point", "kml-polygon"].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });

      if (map.getSource(sourceId)) map.removeSource(sourceId);

      setActive(false);
      return;
    }

    try {
      const url = "/layers/Tariq/bins.kml";

      const res = await fetch(url, { cache: "no-store" });
      const kmlText = await res.text();

      const geojson = parseKmlToGeoJSON(kmlText);

      // add source
      map.addSource(sourceId, {
        type: "geojson",
        data: geojson,
      });

      // 🧠 تحميل PNG كـ icon
      if (!map.hasImage(iconId)) {
        map.loadImage("/recycling-bin.png", (error: any, image: any) => {
          if (error) {
            console.error("Icon load error:", error);
            return;
          }

          if (!map.hasImage(iconId)) {
            map.addImage(iconId, image);
          }

          addLayers(map);
        });
      } else {
        addLayers(map);
      }

      setActive(true);
    } catch (err) {
      console.error("KML error:", err);
    }
  };

  const addLayers = (map: any) => {
    // 🟥 LINE
    map.addLayer({
      id: "kml-line",
      type: "line",
      source: sourceId,
      filter: ["==", "$type", "LineString"],
      paint: {
        "line-color": "#ff0000",
        "line-width": 3,
      },
    });

    // 🟢 POINTS -> PNG ICON
    map.addLayer({
      id: "kml-point",
      type: "symbol",
      source: sourceId,
      filter: ["==", "$type", "Point"],
      layout: {
        "icon-image": iconId,
        "icon-size": 0.08,
        "icon-allow-overlap": true,
      },
    });

    // 🟩 POLYGONS
    map.addLayer({
      id: "kml-polygon",
      type: "fill",
      source: sourceId,
      filter: ["==", "$type", "Polygon"],
      paint: {
        "fill-color": "#ff0000",
        "fill-opacity": 0.25,
      },
    });
  };

  return (
    <button
      onClick={toggleKml}
      className="absolute bottom-6 right-6 z-10 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg"
    >
      {active ? "Hide KML" : "Show KML"}
    </button>
  );
}