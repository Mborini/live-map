"use client";

import {
  Card,
  Text,
  Badge,
  Group,
  Image,
  Stack,
} from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import { Complaint } from "@/lib/types/complaint";


export function ComplaintPopup({ complaint }: { complaint: Complaint }) {
  const status = (complaint as any).status_name ?? "new";

  const title =
    (complaint as any).type_name
      ? `${(complaint as any).type_name}${
          (complaint as any).sub_type_name
            ? " - " + (complaint as any).sub_type_name
            : ""
        }`
      : "بلاغ";

  return (
    <Card
      radius="lg"
      shadow="lg"
      withBorder
      p="sm"
      w={320}
    >
      <Stack gap="xs">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group gap={6} align="center">
            <IconMapPin size={16} />
            <Text fw={600} size="sm">
              {title}
            </Text>
          </Group>

          <Badge
            color={"red"}
            variant="light"
          >
            {status.replace("_", " ")}
          </Badge>
        </Group>

        {/* Image */}
        {complaint.image_url && (
          <Image
            src={complaint.image_url}
            radius="md"
            alt="Complaint image"
            width={"100%"}
            height={50}
          />
        )}
      </Stack>
    </Card>
  );
}