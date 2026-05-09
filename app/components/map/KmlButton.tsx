"use client";

import { Checkbox, Modal, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { FaTrash, FaTools } from "react-icons/fa";

type Props = {
  mapRef: any;
};

type Bin = {
  id: number;
  name: string;
  points: { lat: number; lng: number }[];
};

// ✅ تحويل Bins المحددة إلى GeoJSON Points
function binsToGeoJSON(bins: Bin[], enabledIds: number[]) {
  return {
    type: "FeatureCollection",
    features: bins
      .filter((bin) => enabledIds.includes(bin.id))
      .flatMap((bin) =>
        bin.points.map((p) => ({
          type: "Feature",
          properties: {
            binId: bin.id,
            name: bin.name,
          },
          geometry: {
            type: "Point",
            coordinates: [p.lng, p.lat],
          },
        })),
      ),
  };
}

export default function KmlButton({ mapRef }: Props) {
  const [bins, setBins] = useState<Bin[]>([]);
  const [enabledBins, setEnabledBins] = useState<number[]>([]);
  const [open, setOpen] = useState(false);

  const sourceId = "bins-source";
  const layerId = "bins-points";
  const iconId = "bin-icon";

  // ✅ تحميل الـ bins من DB مرة واحدة
  useEffect(() => {
    fetch("/api/bins", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setBins(data);
        setEnabledBins(data.map((b: Bin) => b.id)); // افتراضياً الكل مفعّل
      });
  }, []);

  // ✅ تحديث الخريطة حسب الاختيارات
  useEffect(() => {
    const map = mapRef.current;
    if (!map || bins.length === 0) return;

    const geojson = binsToGeoJSON(bins, enabledBins);

    // source
    if (map.getSource(sourceId)) {
      map.getSource(sourceId).setData(geojson);
    } else {
      map.addSource(sourceId, {
        type: "geojson",
        data: geojson,
      });
    }

    // image
    if (!map.hasImage(iconId)) {
      map.loadImage("/recycling-bin.png", (err: any, image: any) => {
        if (err || !image) return;
        if (!map.hasImage(iconId)) map.addImage(iconId, image);
        addLayer(map);
      });
    } else {
      addLayer(map);
    }
  }, [bins, enabledBins, mapRef]);

  const addLayer = (map: any) => {
    if (map.getLayer(layerId)) return;

    map.addLayer({
      id: layerId,
      type: "symbol",
      source: sourceId,
      layout: {
        "icon-image": iconId,
        "icon-size": 0.07,
        "icon-allow-overlap": true,
      },
    });
  };

  // ✅ Toggle checkbox
  const toggleBin = (id: number) => {
    setEnabledBins((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <>
      {/* 🧰 BUTTON + PANEL CONTAINER */}
      <div dir="rtl" className="fixed top-40 right-2 z-[9999]">
        {/* 🧰 Button */}
        <button
          onClick={() => setOpen(!open)}
          className="bg-white shadow-lg p-2 rounded-md hover:bg-gray-100"
        >
          <FaTrash size={16} />
        </button>

        {/* ✅ Checkbox Panel */}

        <Modal
          opened={open}
          onClose={() => setOpen(false)}
          title="Bins"
          size="sm"
        >
          <Stack gap="xs">
            {bins.map((bin) => (
              <Checkbox
                key={bin.id}
                label={bin.name}
                checked={enabledBins.includes(bin.id)}
                onChange={() => toggleBin(bin.id)}
              />
            ))}
          </Stack>
        </Modal>
      </div>
    </>
  );
}
