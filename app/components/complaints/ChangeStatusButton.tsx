"use client";

import { useState } from "react";
import { Button, Modal, Stack, Textarea, Select, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

type Props = {
  complaintId: number;
  onSubmit: (id: number, status: number, description: string) => Promise<void>;
};

export default function ChangeStatusButton({ complaintId, onSubmit }: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [status, setStatus] = useState<number | null>(null);
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!status || !description.trim()) return;

    await onSubmit(complaintId, status, description);
    setStatus(null);
    setDescription("");
    close();
  };

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
      >
        تغيير الحالة
      </Button>

      <Modal opened={opened} onClose={close} centered title="تحديث حالة الشكوى">
        <Stack>
          <Select
            label="الحالة"
            placeholder="اختر الحالة"
            required
            data={[
              { value: "2", label: "قيد المعالجة" },
              { value: "3", label: "مغلقة" },
              { value: "4", label: "مرفوضة" },
            ]}
            value={status?.toString()}
            onChange={(value) => setStatus(value ? parseInt(value) : null)}
          />

          <Textarea
            label="وصف المعالجة"
            placeholder="اكتب وصفاً واضحاً (إجباري)"
            required
            minRows={4}
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            error={!description.trim() ? "الوصف إجباري" : undefined}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              إلغاء
            </Button>
            <Button onClick={handleSubmit} disabled={!status || !description.trim()}>
              حفظ
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}