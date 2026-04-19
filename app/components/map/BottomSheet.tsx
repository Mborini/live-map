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
  code: string;
};

type ReportType = {
  id: number;
  name: string;
  code: string;
  subtypes: SubType[];
};

type Props = {
  mapRef: any;
};

export default function BottomSheet({ mapRef }: Props) {
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const { data: session, status } = useSession();

  const [types, setTypes] = useState<ReportType[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);

  const [type, setType] = useState<string | null>(null);
  const [subType, setSubType] = useState<string | null>(null);

  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState<any>({});

  const [shift, setShift] = useState<string | null>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [supervisorName, setSupervisorName] = useState<string>("");
  const [supervisorArea, setSupervisorArea] = useState<string>("");
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [supervisorZoneId, setSupervisorZoneId] = useState<number | null>(null);
  // =========================
  // OPEN / CLOSE HANDLERS
  // =========================
  const openDrawer = useCallback(() => {
    if (animating) return;

    setAnimating(true);
    setOpen(true);

    setTimeout(() => setAnimating(false), 300);
  }, [animating]);

  const closeDrawer = useCallback(() => {
    if (animating) return;

    setAnimating(true);
    setOpen(false);

    setTimeout(() => setAnimating(false), 300);
  }, [animating]);

  // =========================
  // LOAD TYPES
  // =========================
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await fetch("/api/reportTypes");
        const data = await res.json();

        if (Array.isArray(data)) setTypes(data);
        else if (data.rows) setTypes(data.rows);
        else setTypes([data]);
      } catch (err) {
        console.error(err);
      }
    };

    loadTypes();
  }, []);

  // =========================
  // LOAD ZONES
  // =========================
  useEffect(() => {
    const loadZones = async () => {
      try {
        const res = await fetch("/api/zones");
        const data = await res.json();
        setZones(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadZones();
  }, []);

  // =========================
  // ADDRESS
  // =========================
  const getAddress = async (lng: number, lat: number) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&language=ar`,
      );

      const data = await res.json();
      const features = data?.features || [];

      const get = (type: string) =>
        features.find((f: any) => f.place_type?.includes(type))?.text || "";

      setAddress({
        address: get("address"),
        poi: get("poi"),
        city: get("place"),
        country: get("country"),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // PICK LOCATION
  // =========================
  const enableManualPick = () => {
    if (!mapRef?.current) return;

    const map = mapRef.current;

    closeDrawer();

    map.getCanvas().style.cursor = "crosshair";

    const handleClick = async (e: mapboxgl.MapMouseEvent) => {
      const c: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      setCoords(c);
      await getAddress(c[0], c[1]);

      const point = turf.point(c);
      let supervisorName = "";
      let supervisorArea = "";

      for (const zone of zones) {
        if (zone.geometry) {
          const inside = turf.booleanPointInPolygon(point, zone.geometry);
          if (inside) {
            supervisorName = zone.supervisor_name;
            supervisorArea = zone.name;
            setSupervisorZoneId(zone.id);
            break;
          }
        }
      }

      setSupervisorName(supervisorName || "No zone found");
      setSupervisorArea(supervisorArea || "No zone found");
      if (markerRef.current) markerRef.current.remove();

      markerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat(c)
        .addTo(map);

      map.getCanvas().style.cursor = "";
      map.off("click", handleClick);

      setTimeout(() => openDrawer(), 150);
    };

    map.once("click", handleClick);
  };
  const formatAddress = (addr: any) => {
    if (!addr) return "";

    return [addr.address, addr.city, addr.country].filter(Boolean).join(", ");
  };
  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = useCallback(async () => {
    if (!type || !subType || !coords )
      return notifications.show({
        title: "Error",
        message: "Please fill all required fields",
        color: "red",
      });

// remove marker 
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

    try {
      const payload = {
        type,
        subType,
        description: desc,
        shift,
        coords: coords
          ? {
              lng: coords[0],
              lat: coords[1],
            }
          : null,

        // 🔥 دمج العنوان
        address: formatAddress(address),
        supervisorZoneId,
        createdAt: new Date().toISOString(),
        user_id: session?.user?.id,
        status: 1,
      };
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit report");

      notifications.show({
        title: "Success",
        message: "Report submitted successfully",
        color: "green",
      });

      closeDrawer();
    } catch (err) {
      console.error(err);

      notifications.show({
        title: "Error",
        message: "Failed to submit report",
        color: "red",
      });
    }
  }, [type, subType, desc, coords, shift, address, supervisorName]);
  // =========================
  // UI
  // =========================
  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={openDrawer}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white p-4 rounded-full shadow-xl "
        >
          <PiMegaphoneDuotone size={26} />
        </button>
      )}

      {/* DRAWER */}
      <Drawer
        opened={open}
        onClose={closeDrawer}
        title="Add New Report"
        position="bottom"
        size="70%"
        overlayProps={{ opacity: 0.4, blur: 3 }}
        radius="lg"
        transitionProps={{
          transition: "slide-up",
          duration: 250,
          timingFunction: "ease",
        }}
        style={{ zIndex: 9999 }}
      >
        <Grid>
          {/* LEFT */}
          <Grid.Col span={6}>
            <Stack gap="sm">
              <Select
                label="Type"
                value={type}
                onChange={(value) => {
                  setType(value);
                  setSubType(null);

                  const selectedType = types.find(
                    (t) => String(t.id) === String(value),
                  );

                  setSubTypes(selectedType?.subtypes || []);
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
                value={[supervisorName, supervisorArea]
                  .filter(Boolean)
                  .join(", ")}
                disabled
              />

              <Textarea
                label="Details"
                value={desc}
                onChange={(e) => setDesc(e.currentTarget.value)}
              />

              <FileInput label="Image" value={image} onChange={setImage} />

              <Button variant="light" onClick={enableManualPick}>
                🖱️ Pick location
              </Button>

              <Button
                color="green"
                disabled={!coords || !type || !subType}
                onClick={handleSubmit}
              >
                Save
              </Button>
            </Stack>
          </Grid.Col>

          {/* RIGHT */}
          <Grid.Col span={6}>
            <Stack gap="sm">
              <Paper p="sm" withBorder h={180}>
                <Text fw={600}>Location</Text>

                {coords ? (
                  <Text size="xs">
                    {address.country} - {address.city}
                  </Text>
                ) : (
                  <Text size="sm" c="dimmed">
                    No location selected
                  </Text>
                )}
              </Paper>

              <Paper p="sm" withBorder h={180}>
                <Text fw={600}>Note</Text>
                <Text size="xs" c="dimmed">
                  Select location to auto detect supervisor
                </Text>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Drawer>
    </>
  );
}
