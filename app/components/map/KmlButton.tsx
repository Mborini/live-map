"use client";

import { useState } from "react";
import { parseKmlToGeoJSON } from "../../utils/kmlUtils";
import { FaTrash, FaTools } from "react-icons/fa";

type Props = {
  mapRef: any;
};

export default function KmlButton({ mapRef }: Props) {
  const [active, setActive] = useState(false);

  // 🧠 TOOL STATES
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("1");

  const sourceId = "kml-source";
  const iconId = "bin-icon";

  const toggleKml = async () => {
    const map = mapRef.current;
    if (!map) return;

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

      map.addSource(sourceId, {
        type: "geojson",
        data: geojson,
      });

      if (!map.hasImage(iconId)) {
        map.loadImage("/recycling-bin.png", (error: any, image: any) => {
          if (error) return;

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
    <>
      {/* 🗑️ KML toggle button */}
      <button
        onClick={toggleKml}
        className="absolute top-40 right-2 z-40 bg-white hover:bg-gray-100 text-gray-800 px-2 py-2 rounded-md shadow-xl cursor-pointer"
        style={{
          background: active ? "#2196F3" : "white",
        }}
      >
        <FaTrash size={16} style={{ color: active ? "white" : "inherit" }} />
      </button>

      {/* 🧰 TOOL BUTTON + PANEL */}
      <div className="absolute top-50 right-2 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="bg-white shadow-lg hover:bg-gray-100 p-2 rounded-md"
        >
          <FaTools size={16} />
        </button>

        {open && (
          <div className="absolute  right-6 w-48 bg-white shadow-xl rounded-md border">
            <div className="max-h-40 overflow-y-auto p-2 space-y-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="radio"
                    name="tool"
                    value={item}
                    checked={value === String(item)}
                    onChange={(e) => setValue(e.target.value)}
                  />
                  Option {item}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
