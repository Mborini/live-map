"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import {
  Button,
  Select,
  TextInput,
  Paper,
  Stack,
  Group,
  Text,
  ScrollArea,
} from "@mantine/core";

import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

type Supervisor = {
  id: number;
  name: string;
};

type Zone = {
  id: number;
  name: string;
  geometry: any;
  supervisor_id: number;
  supervisor_name: string;
  shift_id: number;
  shift_name: string;
};

// 🎨 colors per zone
const getColor = (id: number) => {
  const colors = [
    "#10b981",
    "#8b5cf6",
    "#06b6d4",
    "#3b82f6",
    "#f43f5e",
    "#14b8a6",
    "#ef4444",
    "#eab308",
    "#f97316",
    "#f59e0b",
    "#f97316",
    "#6366f1",
    "#ec4899",
    
  ];
  return colors[id % colors.length];
};

export default function ZonesPage() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const [zones, setZones] = useState<Zone[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [editZoneId, setEditZoneId] = useState<number | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      supervisor_id: "",
      shift: 1,
    },
    validate: {
      name: (v) => (v.trim().length < 2 ? "Zone name required" : null),
      supervisor_id: (v) => (!v ? "Supervisor required" : null),
      shift: (v) => (!v ? "Shift required" : null),
    },
  });

  // SAFE REMOVE
  const safeRemove = (
    map: mapboxgl.Map,
    id: string,
    type: "layer" | "source",
  ) => {
    if (type === "layer" && map.getLayer(id)) map.removeLayer(id);
    if (type === "source" && map.getSource(id)) map.removeSource(id);
  };
useEffect(() => {
  const load = async () => {
    const res = await fetch("/api/zones");
    const data = await res.json();

    setZones(Array.isArray(data) ? data : []);
  };

  load();
}, []);
  // INIT MAP
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [35.9, 31.9],
      zoom: 12,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl());

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
    });

    drawRef.current = draw;
    map.addControl(draw);

    // 🟣 POPUP INIT
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    popupRef.current = popup;

    // 🟢 HOVER EVENT (ARABIC SAFE)
    map.on("mousemove", "zones-fill", (e: any) => {
      const feature = e.features?.[0];
      if (!feature) return;

      map.getCanvas().style.cursor = "pointer";

      popup
        .setLngLat(e.lngLat)
        .setHTML(
          `
          <div style="direction: rtl; font-family: Arial; text-align:right">
            <b>${feature.properties.name}</b><br/>
            ${feature.properties.supervisor}
          </div>
        `,
        )
        .addTo(map);
    });

    map.on("mouseleave", "zones-fill", () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    });

    return () => map.remove();
  }, []);

  // LOAD DATA
  useEffect(() => {
    const load = async () => {
      const [z, s] = await Promise.all([
        fetch("/api/zones").then((r) => r.json()),
        fetch("/api/supervisors").then((r) => r.json()),
      ]);

      setZones(z);
      setSupervisors(s);
    };

    load();
  }, []);

  // RENDER ZONES (NO LABELS ANYMORE)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !zones.length) return;

    const render = () => {
      if (!map.isStyleLoaded()) return setTimeout(render, 200);

      safeRemove(map, "zones-fill", "layer");
      safeRemove(map, "zones-line", "layer");
      safeRemove(map, "zones", "source");

      const geojson = {
        type: "FeatureCollection",
        features: zones.map((z) => ({
          type: "Feature",
          geometry:
            typeof z.geometry === "string"
              ? JSON.parse(z.geometry)
              : z.geometry,
          properties: {
            name: z.name,
            supervisor: z.supervisor_name,
            color: getColor(z.id),
          },
        })),
      };

      map.addSource("zones", {
        type: "geojson",
        data: geojson as any,
      });

      // FILL
      map.addLayer({
        id: "zones-fill",
        type: "fill",
        source: "zones",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.35,
        },
      });

      // BORDER
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

  // 🎯 FOCUS
  const focusZone = (zone: Zone) => {
    const map = mapRef.current;
    if (!map) return;

    const geometry =
      typeof zone.geometry === "string"
        ? JSON.parse(zone.geometry)
        : zone.geometry;

    const coords = geometry.coordinates[0];

    const bounds = coords.reduce(
      (b: any, c: any) => b.extend(c),
      new mapboxgl.LngLatBounds(coords[0], coords[0]),
    );

    map.fitBounds(bounds, {
      padding: 80,
      duration: 1200,
    });
  };

  // EDIT + FOCUS
  const handleEdit = (zone: Zone) => {
    setEditZoneId(zone.id);

    form.setValues({
      name: zone.name,
      supervisor_id: String(zone.supervisor_id),
    });

    focusZone(zone);

    const draw = drawRef.current;
    if (!draw) return;

drawRef.current?.deleteAll();
    const geom =
      typeof zone.geometry === "string"
        ? JSON.parse(zone.geometry)
        : zone.geometry;

    draw.add({
      type: "Feature",
      geometry: geom,
      properties: { dbId: zone.id },
    } as any);
  };

  // DELETE
  const handleDelete = async (id: number) => {
    if (!confirm("Delete zone?")) return;

    await fetch(`/api/zones/${id}`, { method: "DELETE" });

    setZones(await fetch("/api/zones").then((r) => r.json()));

    notifications.show({
      title: "Deleted",
      message: "Zone removed",
      color: "red",
    });
  };

  // SAVE
  const handleSave = async () => {
    const all = drawRef.current?.getAll();

    if (!all?.features.length) {
      notifications.show({
        title: "Error",
        message: "Draw zone first",
        color: "red",
      });
      return;
    }

    const feature = all.features[0];

    const url = editZoneId ? `/api/zones/${editZoneId}` : "/api/zones";
    const method = editZoneId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.values.name,
        supervisor_id: Number(form.values.supervisor_id),
        geometry: feature.geometry,
        shift: Number(form.values.shift),
      }),
    });

    const data = await res.json();

    if (data.success) {
      form.reset();
      setEditZoneId(null);
      drawRef.current?.deleteAll();

      setZones(await fetch("/api/zones").then((r) => r.json()));

      notifications.show({
        title: "Success",
        message: editZoneId ? "Updated" : "Created",
        color: "green",
      });
    }
  };

  return (
    <div className="w-full h-screen relative">
      {/* MAP */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* PANEL */}
      <Paper
        shadow="md"
        p="md"
        className="absolute top-4 left-4 w-[360px] z-50"
      >
        <Stack>
          <Text fw={700} size="lg">
            {editZoneId ? "Edit Zone" : "Create Zone"}
          </Text>

          <TextInput
            label="Zone Name"
            required
            {...form.getInputProps("name")}
          />

          <Select
            label="Supervisor"
            required
            data={supervisors.map((s) => ({
              value: String(s.id),
              label: s.name,
            }))}
            {...form.getInputProps("supervisor_id")}
          />
          <Select
            label="Shift"
            required
            data={[
              { value: 1, label: "A" },
              { value: 2, label: "B" },
              { value: 3, label: "C" },
            ]}
            {...form.getInputProps("shift")}
          />

          <Button onClick={handleSave} disabled={!form.isValid()}>
            {editZoneId ? "Update" : "Save"}
          </Button>

          <ScrollArea h={260}>
            <Stack mt="sm">
              {zones.map((z) => (
                <Paper
                  key={z.id}
                  p="xs"
                  withBorder
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => focusZone(z)}
                >
                  <Group justify="space-between">
                    <div>
                      <Text fw={600}>{z.name}</Text>
                      <Text size="xs" c="dimmed">
                        {z.supervisor_name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {z.shift_name}
                      </Text>
                    </div>

                    <Group gap={5}>
                      <Button
                        size="xs"
                        variant="light"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(z);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="xs"
                        color="red"
                        variant="light"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(z.id);
                        }}
                      >
                        Delete
                      </Button>
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
        </Stack>
      </Paper>
    </div>
  );
}
