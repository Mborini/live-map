"use client";

import { useRef, useState } from "react";
import { Drawer } from "vaul";
import mapboxgl from "mapbox-gl";
import { PiMegaphoneDuotone } from "react-icons/pi";

export default function BottomSheet({ mapRef }: any) {
  const [open, setOpen] = useState(false);

  const [type, setType] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState("");

  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // 🌍 Reverse Geocoding (clean + safe)
  const getAddress = async (lng: number, lat: number) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );

      const data = await res.json();
      setAddress(data?.features?.[0]?.place_name || "غير معروف");
    } catch {
      setAddress("فشل جلب العنوان");
    }
  };

  // 🖱️ Manual Pick (ONLY feature)
  const enableManualPick = () => {
    if (!mapRef?.current) return;

    const map = mapRef.current;

    setOpen(false);
    map.getCanvas().style.cursor = "crosshair";

    const handleClick = async (e: mapboxgl.MapMouseEvent) => {
      const c: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      setCoords(c);

      await getAddress(c[0], c[1]);

      // remove old marker
      if (markerRef.current) markerRef.current.remove();

      // add new marker
      markerRef.current = new mapboxgl.Marker({
        color: "#ef4444",
      })
        .setLngLat(c)
        .addTo(map);

      // reset UI state
      map.getCanvas().style.cursor = "";
      map.off("click", handleClick);

      setOpen(true);
    };

    map.on("click", handleClick);
  };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      {/* Trigger Button */}
      <Drawer.Trigger asChild>
        <button className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-yellow-500 text-white p-4 rounded-full shadow-xl z-9999">
          <PiMegaphoneDuotone size={28} />
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-9998" />

        <Drawer.Content className="fixed bottom-0 left-0 right-0 h-[70vh] bg-white rounded-t-2xl p-5 z-9999 overflow-y-auto">
          <Drawer.Title className="text-lg font-bold mb-4">
            تسجيل بلاغ
          </Drawer.Title>
          {/* Type */}
          <select
            className="w-full border p-2 rounded mb-3"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">اختر نوع البلاغ</option>
            <option value="accident">حادث</option>
            <option value="traffic">ازدحام</option>
          </select>

          {/* Description */}
          <textarea
            className="w-full border p-2 rounded mb-3"
            placeholder="اكتب التفاصيل..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          {/* Image */}
          <input
            type="file"
            className="w-full mb-4"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />

          {/* Manual pick button */}
          <button
            onClick={enableManualPick}
            className="w-full p-3 rounded bg-gray-200 hover:bg-gray-300 transition mb-4"
          >
            🖱️ اختر الموقع من الخريطة
          </button>

          {/* Coordinates */}
          {coords && (
            <div className="space-y-2 mb-4">
              <input
                className="w-full border p-2 rounded bg-gray-100"
                value={`${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`}
                disabled
              />

              <input
                className="w-full border p-2 rounded bg-gray-100"
                value={address || "جاري جلب العنوان..."}
                disabled
              />
            </div>
          )}

          {/* Submit */}
          <button
            onClick={() => {
              console.log({ type, desc, image, coords, address });
              alert("تم إرسال البلاغ ✅");
              setOpen(false);
            }}
            disabled={!coords}
            className="w-full bg-green-600 text-white p-3 rounded disabled:opacity-50"
          >
            إرسال البلاغ
          </button>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}