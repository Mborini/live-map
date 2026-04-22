"use client";

import { useEffect, useRef } from "react";
import { Complaint } from "@/lib/types/complaint";
import {
  Paper,
  Stack,
  Text,
  ScrollArea,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import ComplaintCard from "./ComplaintCard";

export default function ComplaintsList({
  complaints,
  onFocus,
  onStatusChange,
  focusedId,
}: {
  complaints: Complaint[];
  onFocus: (c: Complaint) => void;
  onStatusChange: (id: number, status: number) => void;
  focusedId: number | null;
}) {
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const isMobile = useMediaQuery("(max-width: 1024px)");

  useEffect(() => {
    if (!focusedId || isMobile) return;
    const el = itemRefs.current[focusedId];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focusedId, isMobile]);

  return (
    <Paper
      shadow="md"
      p="md"
      className={
        isMobile
          ? "fixed bottom-0 left-0 right-0 z-50 rounded-t-xl"
          : "absolute top-4 left-4 z-50 w-[360px]"
      }
      style={{
        height: isMobile ? "35vh" : "auto",
      }}
    >
      <Text fw={700} size={isMobile ? "sm" : "lg"} mb="sm">
        الشكاوى
      </Text>

      <ScrollArea h={isMobile ? "calc(35vh - 50px)" : 520}>
        <Stack>
          {complaints.map((c) => (
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
                onStatusChange={onStatusChange}
              />
            </div>
          ))}
        </Stack>
      </ScrollArea>
    </Paper>
  );
}