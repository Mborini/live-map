"use client";

import { useEffect, useRef, useState } from "react";
import { Complaint } from "@/lib/types/complaint";
import {
  Paper,
  Stack,
  Text,
  ScrollArea,
  ActionIcon,
  Group,
  Button,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconChevronUp,
  IconLayoutSidebarLeftExpand,
  IconList,
} from "@tabler/icons-react";
import ComplaintCard from "./ComplaintCard";

export default function ComplaintsList({
  complaints,
  onFocus,
  focusedId,
}: {
  complaints: Complaint[];
  onFocus: (c: Complaint) => void;
  focusedId: number | null;
}) {
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [open, setOpen] = useState(true);

  /* ✅ useEffect دائمًا يُنفَّذ */
  useEffect(() => {
    if (!focusedId || isMobile || !open) return;
    const el = itemRefs.current[focusedId];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focusedId, isMobile, open]);

  return (
    <>
      {/* ✅ CLOSED STATE (زر فقط) */}
      {!open && (
        <div
          className={
            isMobile
              ? "fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
              : "absolute top-6 left-6 z-50"
          }
        >
          <Button
            leftSection={<IconList size={16} />}
            radius="xl"
            variant="light"
            onClick={() => setOpen(true)}
          >
            عرض الشكاوى
          </Button>
        </div>
      )}

      {/* ✅ OPEN STATE */}
      {open && (
        <Paper
          shadow="md"
          radius="lg"
          className={
            isMobile
              ? "fixed bottom-0 left-0 right-0 z-50"
              : "absolute top-4 left-4 z-50"
          }
          style={{
            height: isMobile ? "78vh" : "calc(100vh - 32px)",
            width: isMobile ? "100%" : 380,
            overflow: "hidden",
          }}
        >
          {/* HEADER */}
          <Group
            justify="space-between"
            align="center"
            px="md"
            h={56}
            style={{
              borderBottom: "1px solid #e9ecef",
              background: "#f8f9fa",
            }}
          >
            <Text fw={700} size="sm" dir="rtl">
              الشكاوى
            </Text>

            <ActionIcon
              variant="subtle"
              onClick={() => setOpen(false)}
            >
              {isMobile
                ? <IconChevronUp />
                : <IconLayoutSidebarLeftExpand />}
            </ActionIcon>
          </Group>

          {/* CONTENT */}
          <ScrollArea
            h={
              isMobile
                ? "calc(78vh - 56px)"
                : "calc(100vh - 88px)"
            }
          >
            <Stack p="md" gap="sm">
              {complaints.length === 0 ? (
                <Text ta="center" c="dimmed" size="sm">
                  لا توجد شكاوى
                </Text>
              ) : (
                complaints.map((c) => (
                  <div
                    key={c.id}
                    ref={(node) => {
                      itemRefs.current[c.id] = node;
                    }}
                  >
                    <ComplaintCard
                      complaint={c}
                      selected={focusedId === c.id}
                      onClick={() => onFocus(c)}
                    />
                  </div>
                ))
              )}
            </Stack>
          </ScrollArea>
        </Paper>
      )}
    </>
  );
}