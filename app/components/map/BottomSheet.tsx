"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";

import {
  Drawer,
  Button,
  Select,
  Textarea,
  FileInput,
  Stack,
  Text,
  Paper,
  Grid,
  TextInput,
} from "@mantine/core";

import { notifications } from "@mantine/notifications";
import { PiMegaphoneDuotone } from "react-icons/pi";
import { useSession } from "next-auth/react";

type SubType = {
  id: number;
  name: string;
};

type ReportType = {
  id: number;
  name: string;
  subtypes: SubType[];
};

type Props = {
  mapRef: any;
};

export default function BottomSheet({ mapRef }: Props) {
  const { data: session } = useSession();

  // ===== UI =====
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);

  // ===== Types =====
  const [types, setTypes] = useState<ReportType[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [type, setType] = useState<string | null>(null);
  const [subType, setSubType] = useState<string | null>(null);

  // ===== Report =====
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // ===== Location =====
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState<any>({});
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // ===== Shift & Zones =====
  const [shift, setShift] = useState<string | null>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [filteredZones, setFilteredZones] = useState<any[]>([]);
  const [supervisorName, setSupervisorName] = useState("");
  const [supervisorArea, setSupervisorArea] = useState("");
  const [supervisorZoneId, setSupervisorZoneId] = useState<number | null>(null);

  // ===== Drawer helpers =====
  const openDrawer = () => {
    if (animating) return;
    setAnimating(true);
    setOpen(true);
    setTimeout(() => setAnimating(false), 250);
  };

  const closeDrawer = () => {
    if (animating) return;
    setAnimating(true);
    setOpen(false);
    setTimeout(() => setAnimating(false), 250);
  };

  // ===== Load types =====
  useEffect(() => {
    fetch("/api/reportTypes")
      .then((r) => r.json())
      .then((d) => setTypes(Array.isArray(d) ? d : d.rows || []));
  }, []);

  // ===== Load zones =====
  useEffect(() => {
    fetch("/api/zones")
      .then((r) => r.json())
      .then((d) => setZones(d));
  }, []);

  // ===== Filter zones by shift =====
  useEffect(() => {
    if (!shift) {
      setFilteredZones([]);
      return;
    }
    setFilteredZones(zones.filter((z) => String(z.shift_id) === String(shift)));
  }, [shift, zones]);

  // ===== Reverse geocode =====
  const getAddress = async (lng: number, lat: number) => {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&language=ar`,
    );
    const data = await res.json();
    const f = data.features || [];

    const get = (k: string) =>
      f.find((x: any) => x.place_type?.includes(k))?.text || "";

    setAddress({
      address: get("address"),
      city: get("place"),
      country: get("country"),
    });
  };

  // ===== Pick location =====
  const enableManualPick = () => {
    if (!shift) {
      notifications.show({
        title: "تنبيه",
        message: "اختر الشِفت أولاً",
        color: "yellow",
      });
      return;
    }

    const map = mapRef.current;
    if (!map) return;

    closeDrawer();
    map.getCanvas().style.cursor = "crosshair";

    const handleClick = async (e: mapboxgl.MapMouseEvent) => {
      const c: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const point = turf.point(c);

      let foundZone: any = null;

      for (const z of filteredZones) {
        if (!z.geometry) continue;

        const geom =
          typeof z.geometry === "string" ? JSON.parse(z.geometry) : z.geometry;

        if (turf.booleanPointInPolygon(point, geom)) {
          foundZone = z;
          break;
        }
      }

      // ❌ خارج المنطقة → نخلي الأداة شغالة
      if (!foundZone) {
        notifications.show({
          title: "تنبيه",
          message: "الموقع خارج المنطقة، الرجاء اختيار موقع داخل المنطقة",
          color: "yellow",
        });
        return;
      }

      // ✅ داخل المنطقة
      setCoords(c);
      await getAddress(c[0], c[1]);

      setSupervisorName(foundZone.supervisor_name);
      setSupervisorArea(foundZone.name);
      setSupervisorZoneId(foundZone.id);

      markerRef.current?.remove();
      markerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat(c)
        .addTo(map);

      // ✅ نوقف الأداة هنا فقط
      map.getCanvas().style.cursor = "";
      map.off("click", handleClick);

      setTimeout(openDrawer, 150);
    };

    // ✅ مهم: on وليس once
    map.on("click", handleClick);
  };
  // ===== Submit =====
  const handleSubmit = async () => {
    if (!type || !subType || !coords || !supervisorZoneId) {
      notifications.show({
        title: "خطأ",
        message: "يرجى تعبئة جميع الحقول",
        color: "red",
      });
      return;
    }

    const fullAddress = [address.address, address.city, address.country]
      .filter(Boolean)
      .join(", ");

    const formData = new FormData();
    formData.append("type", type);
    formData.append("subType", subType);
    formData.append("description", desc);
    formData.append("shift", shift!);
    formData.append("lng", String(coords[0]));
    formData.append("lat", String(coords[1]));
    formData.append("address", fullAddress);
    formData.append("supervisorZoneId", String(supervisorZoneId));
    formData.append("user_id", String(session?.user?.id || ""));

    if (image) {
      formData.append("image", image);
    }

    await fetch("/api/complaints", {
      method: "POST",
      body: formData,
    });

    notifications.show({
      title: "تم",
      message: "تم إرسال البلاغ بنجاح",
      color: "green",
    });

    closeDrawer();
  };

  // ===== UI =====
  return (
    <>
      {!open && (
        <button
          onClick={openDrawer}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white p-4 rounded-full"
        >
          <PiMegaphoneDuotone size={26} />
        </button>
      )}

      <Drawer opened={open} onClose={closeDrawer} position="bottom" size="70%">
        <Grid>
          <Grid.Col span={6}>
            <Stack>
              <Select
                label="Type"
                value={type}
                onChange={(v) => {
                  setType(v);
                  setSubType(null);
                  setSubTypes(
                    types.find((t) => String(t.id) === v)?.subtypes || [],
                  );
                }}
                data={types.map((t) => ({
                  value: String(t.id),
                  label: t.name,
                }))}
              />

              <Select
                label="Sub Type"
                value={subType}
                onChange={setSubType}
                data={subTypes.map((s) => ({
                  value: String(s.id),
                  label: s.name,
                }))}
                disabled={!type}
              />

              <Select
                label="Shift"
                value={shift}
                onChange={setShift}
                data={[
                  { value: "1", label: "A" },
                  { value: "2", label: "B" },
                  { value: "3", label: "C" },
                ]}
              />

              <TextInput
                label="Supervisor"
                value={`${supervisorName} - ${supervisorArea}`}
                disabled
              />

              <Textarea
                label="Details"
                value={desc}
                onChange={(e) => setDesc(e.currentTarget.value)}
              />

              <FileInput
                label="Image"
                value={image}
                onChange={setImage}
                accept="image/*"
              />

              <Button onClick={enableManualPick} disabled={!shift}>
                🖱️ Pick location
              </Button>

              <Button color="green" onClick={handleSubmit}>
                Save
              </Button>
            </Stack>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper withBorder p="sm">
              <Text fw={600}>Location Info</Text>
              {coords ? (
                <>
                  <Text size="sm">📍 {address.address}</Text>
                  <Text size="sm">🏙️ {address.city}</Text>
                  <Text size="sm">🌍 {address.country}</Text>
                </>
              ) : (
                <Text c="dimmed">No location selected</Text>
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      </Drawer>
    </>
  );
}
