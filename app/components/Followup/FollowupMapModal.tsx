"use client";

import {
  Modal,
  Image,
  Stack,
  Text,
  SimpleGrid,
  Box,
  Paper,
  Group,
  Badge,
  ThemeIcon,
  Divider,
  ScrollArea,
  ActionIcon,
  Tooltip,
  CopyButton,
  Button,
} from "@mantine/core";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { initRTL } from "@/lib/mapbox-rtl";
import { useEffect, useMemo, useRef } from "react";

type Props = {
  opened: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  imageUrl?: string | null;
  description?: string | null;
  user?: string | null;
  shift?: string | null;
  zone?: string | null;
  supervisor?: string | null;
  address?: string | null;
  created_at?: string | null;
  id?: number | null;
};

type InfoItem = {
  key: string;
  label: string;
  value: string;
  full?: boolean;
};

export default function FollowupMapModal({
  opened,
  onClose,
  lat,
  lng,
  imageUrl,
  description,
  user,
  shift,
  zone,
  supervisor,
  address,
  created_at,
  id,
}: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markerInstance = useRef<mapboxgl.Marker | null>(null);

  const fallback = "غير متوفر";

  const latitude = Number(lat);
  const longitude = Number(lng);

  const isValidCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  const coordinatesText = isValidCoordinates
    ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    : fallback;

  const googleMapsUrl = isValidCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : "#";

  const formattedDate = useMemo(() => {
    if (!created_at) return fallback;

    const date = new Date(created_at);

    if (Number.isNaN(date.getTime())) {
      return created_at;
    }

    return new Intl.DateTimeFormat("ar-JO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }, [created_at]);

  const infoItems: InfoItem[] = useMemo(
    () => [
      {
        key: "report-id",
        label: "رقم البلاغ",
        value: id ? `#${id}` : fallback,
      },
      {
        key: "created-at",
        label: "تاريخ البلاغ",
        value: formattedDate,
      },
      {
        key: "coordinates",
        label: "الإحداثيات",
        value: coordinatesText,
        full: true,
      },
      {
        key: "address",
        label: "العنوان",
        value: address?.trim() || fallback,
        full: true,
      },
      {
        key: "description",
        label: "الوصف",
        value: description?.trim() || fallback,
        full: true,
      },
      {
        key: "shift",
        label: "الشفت",
        value: shift?.trim() || fallback,
      },
      {
        key: "zone",
        label: "المنطقة",
        value: zone?.trim() || fallback,
      },
      {
        key: "user",
        label: "المستخدم",
        value: user?.trim() || fallback,
      },
      {
        key: "supervisor",
        label: "المشرف",
        value: supervisor?.trim() || fallback,
      },
    ],
    [
      id,
      formattedDate,
      coordinatesText,
      address,
      description,
      shift,
      zone,
      user,
      supervisor,
    ]
  );

  useEffect(() => {
    if (!opened) {
      markerInstance.current?.remove();
      markerInstance.current = null;

      mapInstance.current?.remove();
      mapInstance.current = null;

      return;
    }

    if (!isValidCoordinates) {
      console.error("Invalid coordinates:", { lat, lng });
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN is missing");
      return;
    }

    let initTimer: ReturnType<typeof setTimeout> | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    const initMap = () => {
      if (!mapContainer.current) return;

      mapboxgl.accessToken = token;
      initRTL();

      mapInstance.current?.remove();
      mapInstance.current = null;

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [longitude, latitude],
        zoom: 15.5,
        pitch: 35,
        bearing: 0,
        attributionControl: false,
      });

      mapInstance.current = map;

      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

      const markerElement = document.createElement("div");
      markerElement.className = "followup-map-marker";

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: "center",
      })
        .setLngLat([longitude, latitude])
        .addTo(map);

      markerInstance.current = marker;

      map.on("load", () => {
        map.resize();
      });

      resizeTimer = setTimeout(() => {
        map.resize();
        map.flyTo({
          center: [longitude, latitude],
          zoom: 15.5,
          speed: 0.8,
          curve: 1.2,
          essential: true,
        });
      }, 550);
    };

    /*
      مهم جدًا:
      ننتظر المودال يفتح ويأخذ أبعاده، بعدها ننشئ الخريطة.
    */
    initTimer = setTimeout(initMap, 280);

    return () => {
      if (initTimer) clearTimeout(initTimer);
      if (resizeTimer) clearTimeout(resizeTimer);

      markerInstance.current?.remove();
      markerInstance.current = null;

      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [opened, lat, lng, latitude, longitude, isValidCoordinates]);

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        size="86rem"
        centered
        radius="xl"
        padding={0}
        withCloseButton
        title={null}
        overlayProps={{
          backgroundOpacity: 0.62,
          blur: 6,
        }}
        transitionProps={{
          transition: "pop",
          duration: 220,
        }}
        styles={{
          content: {
            direction: "rtl",
            maxHeight: "92vh",
            overflow: "hidden",
            background:
              "linear-gradient(180deg, var(--mantine-color-gray-0) 0%, #ffffff 42%)",
          },
          header: {
            display: "none",
          },
          body: {
            height: "92vh",
            overflow: "hidden",
            padding: 0,
          },
        }}
      >
        <Stack gap={0} h="100%">
          {/* Header */}
          <Box
            px="lg"
            py="md"
            style={{
              borderBottom: "1px solid var(--mantine-color-gray-2)",
              background:
                "linear-gradient(135deg, rgba(250,82,82,0.10), rgba(34,139,230,0.06))",
            }}
          >
            <Group justify="space-between" align="center" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size={46} radius="xl" color="red" variant="light">
                  📍
                </ThemeIcon>

                <Box>
                  <Group gap="xs" align="center">
                    <Text fw={800} size="xl">
                      موقع البلاغ
                    </Text>

                    {id ? (
                      <Badge color="dark" variant="light" radius="md">
                        #{id}
                      </Badge>
                    ) : null}
                  </Group>

                  <Text size="sm" c="dimmed" mt={2}>
                    تفاصيل الموقع، الصورة، ومعلومات المتابعة
                  </Text>
                </Box>
              </Group>

              <Group gap="xs" wrap="nowrap">
                {isValidCoordinates && (
                  <>
                    <CopyButton value={coordinatesText}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? "تم النسخ" : "نسخ الإحداثيات"}>
                          <ActionIcon
                            size="lg"
                            radius="md"
                            variant="light"
                            color={copied ? "green" : "gray"}
                            onClick={copy}
                          >
                            ⧉
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>

                    <Tooltip label="فتح في Google Maps">
                      <ActionIcon
                        component="a"
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="lg"
                        radius="md"
                        variant="light"
                        color="blue"
                      >
                        ↗
                      </ActionIcon>
                    </Tooltip>
                  </>
                )}

                <Button radius="md" variant="light" color="gray" onClick={onClose}>
                  إغلاق
                </Button>
              </Group>
            </Group>
          </Box>

          {/* Body */}
          <ScrollArea h="100%" offsetScrollbars type="auto">
            <Box p="lg">
              <SimpleGrid
                cols={{ base: 1, lg: imageUrl ? 2 : 1 }}
                spacing="lg"
                verticalSpacing="lg"
              >
                {/* Left side */}
                <Stack gap="lg">
                  {/* Map Card */}
                  <Paper
                    withBorder
                    radius="xl"
                    shadow="sm"
                    p="xs"
                    style={{
                      overflow: "hidden",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <Group justify="space-between" px="sm" py="xs">
                      <Box>
                        <Text fw={800} size="md">
                          الخريطة
                        </Text>
                        <Text size="xs" c="dimmed">
                          الموقع الجغرافي للبلاغ
                        </Text>
                      </Box>

                      <Badge
                        color={isValidCoordinates ? "green" : "red"}
                        variant="light"
                        radius="md"
                      >
                        {isValidCoordinates ? "إحداثيات صحيحة" : "إحداثيات غير صحيحة"}
                      </Badge>
                    </Group>

                    <Divider my="xs" />

                    <Box
                      style={{
                        position: "relative",
                        height: "clamp(320px, 45vh, 460px)",
                        minHeight: 320,
                        borderRadius: 18,
                        overflow: "hidden",
                        background:
                          "linear-gradient(135deg, var(--mantine-color-gray-1), var(--mantine-color-gray-0))",
                        border: "1px solid var(--mantine-color-gray-2)",
                      }}
                    >
                      {opened && isValidCoordinates ? (
                        <Box
                          ref={mapContainer}
                          style={{
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      ) : (
                        <Stack
                          h="100%"
                          align="center"
                          justify="center"
                          gap="xs"
                          p="lg"
                          ta="center"
                        >
                          <ThemeIcon size={52} radius="xl" color="red" variant="light">
                            !
                          </ThemeIcon>
                          <Text fw={700}>لا يمكن عرض الخريطة</Text>
                          <Text size="sm" c="dimmed">
                            الإحداثيات غير صحيحة أو غير متوفرة
                          </Text>
                        </Stack>
                      )}

                      {isValidCoordinates && (
                        <Paper
                          withBorder
                          radius="lg"
                          shadow="md"
                          px="sm"
                          py={8}
                          style={{
                            position: "absolute",
                            right: 12,
                            bottom: 12,
                            zIndex: 2,
                            backgroundColor: "rgba(255,255,255,0.94)",
                            backdropFilter: "blur(8px)",
                          }}
                        >
                          <Text size="xs" c="dimmed">
                            الإحداثيات
                          </Text>
                          <Text size="sm" fw={800} dir="ltr">
                            {coordinatesText}
                          </Text>
                        </Paper>
                      )}
                    </Box>
                  </Paper>

                  {/* Info Card */}
                  <Paper withBorder radius="xl" p="lg" shadow="xs">
                    <Group justify="space-between" mb="md">
                      <Box>
                        <Text fw={800} size="lg">
                          بيانات البلاغ
                        </Text>
                        <Text size="sm" c="dimmed">
                          معلومات البلاغ والتفاصيل المرتبطة به
                        </Text>
                      </Box>

                      <Badge color="red" variant="light" radius="md" size="lg">
                        متابعة
                      </Badge>
                    </Group>

                    <Divider mb="md" />

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                      {infoItems.map((item) => (
                        <Paper
                          key={item.key}
                          withBorder
                          radius="lg"
                          p="md"
                          style={{
                            gridColumn: item.full ? "1 / -1" : undefined,
                            background:
                              item.value === fallback
                                ? "var(--mantine-color-gray-0)"
                                : "#ffffff",
                          }}
                        >
                          <Text size="xs" c="dimmed" mb={6}>
                            {item.label}
                          </Text>

                          <Text
                            size="sm"
                            fw={700}
                            style={{
                              wordBreak: "break-word",
                              lineHeight: 1.8,
                            }}
                          >
                            {item.value}
                          </Text>
                        </Paper>
                      ))}
                    </SimpleGrid>
                  </Paper>
                </Stack>

                {/* Right side - Image */}
                {imageUrl && (
                  <Paper withBorder radius="xl" p="lg" shadow="xs">
                    <Group justify="space-between" mb="md">
                      <Box>
                        <Text fw={800} size="lg">
                          صورة البلاغ
                        </Text>
                        <Text size="sm" c="dimmed">
                          المرفق الخاص بالبلاغ
                        </Text>
                      </Box>

                      <Badge variant="light" color="blue" radius="md" size="lg">
                        مرفق
                      </Badge>
                    </Group>

                    <Divider mb="md" />

                    <Box
                      style={{
                        height: "clamp(420px, 72vh, 720px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        borderRadius: 20,
                        background:
                          "linear-gradient(135deg, var(--mantine-color-gray-0), #ffffff)",
                        border: "1px solid var(--mantine-color-gray-2)",
                      }}
                    >
                      <Image
                        src={imageUrl}
                        alt="صورة البلاغ"
                        fit="contain"
                        radius="lg"
                        w="100%"
                        h="100%"
                        fallbackSrc="https://placehold.co/900x700?text=No+Image"
                        style={{
                          objectPosition: "center",
                        }}
                      />
                    </Box>
                  </Paper>
                )}
              </SimpleGrid>
            </Box>
          </ScrollArea>
        </Stack>
      </Modal>

      <style jsx global>{`
        .followup-map-marker {
          position: relative;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: #fa5252;
          border: 4px solid #ffffff;
          box-shadow: 0 10px 25px rgba(250, 82, 82, 0.5);
          cursor: pointer;
        }

        .followup-map-marker::after {
          content: "";
          position: absolute;
          inset: -12px;
          border-radius: 999px;
          border: 2px solid rgba(250, 82, 82, 0.45);
          animation: followup-marker-pulse 1.6s ease-out infinite;
        }

        @keyframes followup-marker-pulse {
          0% {
            transform: scale(0.55);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.45);
            opacity: 0;
          }
        }

        .mapboxgl-ctrl-group {
          border-radius: 14px !important;
          overflow: hidden !important;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.14) !important;
          border: 1px solid rgba(229, 231, 235, 0.9) !important;
        }

        .mapboxgl-ctrl button {
          width: 36px !important;
          height: 36px !important;
        }

        .mapboxgl-ctrl-attrib {
          border-radius: 10px !important;
          margin: 8px !important;
        }
      `}</style>
    </>
  );
}