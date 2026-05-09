"use client";

import { Paper, Stack, Text, Button } from "@mantine/core";
import { Zone } from "@/lib/types/zones";

export default function ZonesPanel({
  zones,
  onDelete,
  onFocus,
}: any) {
  return (
    <Paper className="absolute top-4 left-4 w-[360px] z-50 p-3 shadow-lg">
      <Stack>
        <Text fw={700}>Zones</Text>

        {zones.map((z: Zone) => (
          <Paper key={z.id} p="xs" withBorder>
            <div className="font-semibold">{z.name}</div>
            <div className="text-xs text-gray-500">
              {z.supervisor_name}
            </div>

            <div className="flex gap-2 mt-2">
              <Button size="xs" onClick={() => onFocus(z)}>
                View
              </Button>

              <Button
                size="xs"
                color="red"
                onClick={() => onDelete(z.id)}
              >
                Delete
              </Button>
            </div>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}