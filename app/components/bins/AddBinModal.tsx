"use client";

import {
  Button,
  Group,
  Modal,
  Stack,
  TextInput,
  FileInput,
} from "@mantine/core";
import { useState } from "react";
import { IconUpload } from "@tabler/icons-react";

type Props = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (name: string, file: File | null) => void;
};

export function AddBinModal({ opened, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  return (
    <Modal opened={opened} onClose={onClose} title="Add Bin" centered>
      <Stack>
        <TextInput
          label="Bin Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />

        <FileInput
          label="File"
          value={file}
          onChange={setFile}
          leftSection={<IconUpload size={16} />}
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>

          <Button
            disabled={!name.trim()}
            onClick={() => {
              onSubmit(name, file);
              setName("");
              setFile(null);
            }}
          >
            Add
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}