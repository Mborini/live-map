"use client";

import { useEffect } from "react";
import { Complaint } from "@/lib/types/complaint";
import {
  Paper,
  Text,
  Badge,
  Group,
  Button,
  Collapse,
  Divider,
  Stack,
  Box,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FaChevronCircleDown, FaChevronCircleUp, FaEye } from "react-icons/fa";
import ChangeStatusButton from "./ChangeStatusButton";
import { useSession } from "next-auth/react";

const statusColor: Record<string, string> = {
  new: "red",
  in_progress: "yellow",
  resolved: "green",
  rejected: "gray",
};

export default function ComplaintCard({
  complaint,
  onClick,
  onStatusChange,
  selected,
}: {
  complaint: Complaint;
  onClick: () => void;
  onStatusChange: (id: number, status: number) => void;
  selected?: boolean;
  userId?: number;
}) {
  const [opened, handlers] = useDisclosure(false);
  const { toggle, open, close } = handlers;
    const { data: session, status } = useSession();
    const userId = session?.user?.id;
  useEffect(() => {
    
    if (selected) open();
    else close();
  }, [selected, open, close]);

  const badgeColor =
    statusColor[complaint.status_name ?? ""] ?? "gray";

async function createComplaintHistory(
  complaintId: number,
  status: number,
  description: string
) {
  const res = await fetch("/api/complaint-history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      complaintId,
      status,
      description,
      userId
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to create complaint history");
  }

  return res.json();
}
  return (
    <Paper withBorder p="md" radius="lg" onClick={onClick}>
      {/* Header */}
      <Group justify="space-between">
        <Box>
          <Text fw={700}>{complaint.type_name ?? "Complaint"}</Text>
          <Text size="xs" c="dimmed">
            {complaint.created_at
              ? new Date(complaint.created_at).toLocaleString()
              : "-"}
          </Text>
        </Box>

        <Group>
          <Badge color={badgeColor}>
            {complaint.status_name ?? "unknown"}
          </Badge>

          <Tooltip label={opened ? "إخفاء التفاصيل" : "عرض التفاصيل"}>
            <ActionIcon
              onClick={(e) => {
                e.stopPropagation();
                toggle();
              }}
            >
              {opened ? (
                <FaChevronCircleUp />
              ) : (
                <FaChevronCircleDown />
              )}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Summary */}
      <Text mt="sm">
        <strong>الوصف:</strong> {complaint.description ?? "-"}
      </Text>

      <Collapse expanded={opened} mt="sm">
        <Divider my="sm" />
        <Stack gap="xs">
          <Text size="xs">Supervisor: {complaint.supervisor_name ?? "-"}</Text>
          <Text size="xs">User: {complaint.username ?? "-"}</Text>
          <Text size="xs">Address: {complaint.address ?? "-"}</Text>
        </Stack>
      </Collapse>

      {/* Actions ✅ */}
      <Group mt="md" justify="space-between">
        <Button
          size="xs"
          variant="light"
          leftSection={<FaEye />}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          عرض
        </Button>

      
<ChangeStatusButton
  complaintId={complaint.id}
  onSubmit={async (id, status, description) => {
    // 1️⃣ Update status
    onStatusChange(id, status);

    // 2️⃣ Insert history
    await createComplaintHistory(id, status, description);
  }}
/>

      </Group>
    </Paper>
  );
}