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
  selected,
  
}: {
  complaint: Complaint;
  onClick: () => void;
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
    statusColor[complaint.status_id == 1
      ? "new"
      : complaint.status_id == 2
      ? "in_progress"
      : complaint.status_id == 3
      ? "resolved"
      : complaint.status_id == 4
      ? "rejected"
      : "gray"];


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
    await fetch("/api/complaints/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        complaintId: id,
        status,
        description,
        userId, // من session
      }),
    });

    // (اختياري) إعادة تحميل البيانات
  }}
/>

      </Group>
    </Paper>
  );
}