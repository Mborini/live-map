'use client';

import { useEffect, useRef } from "react";
import { Complaint } from "@/lib/types/complaint";
import { Paper, Stack, Text, ScrollArea } from "@mantine/core";
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

  useEffect(() => {
    if (!focusedId) return;
    const el = itemRefs.current[focusedId];
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focusedId]);

  return (
    <Paper shadow="md" p="md" className="absolute top-4 left-4  z-50">
      <Text fw={700} size="lg" mb="sm">
        الشكاوى
      </Text>

      <ScrollArea h={520}>
        <Stack>
          {complaints.map((c) => (
            <div key={c.id} ref={(node) => { itemRefs.current[c.id] = node; }}>
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