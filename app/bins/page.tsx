"use client";

import { useState } from "react";
import {
  Button,
  Container,
  Group,
  Modal,
  Table,
  Text,
  TextInput,
  Title,
  ActionIcon,
  Card,
  Stack,
  FileInput,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { FaTrash, FaUpload } from "react-icons/fa";

type Bin = {
  id: number;
  name: string;
  file?: File | null;
};

export default function BinsPage() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  // ➕ Add Bin
  const handleAddBin = () => {
    if (!name.trim()) return;

    const newBin: Bin = {
      id: Date.now(),
      name: name.trim(),
      file,
    };

    setBins((prev) => [...prev, newBin]);

    setName("");
    setFile(null);
    close();
  };

  // ❌ Delete Bin
  const handleDelete = (id: number) => {
    setBins((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <Container size="lg" py="md">
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Title order={isMobile ? 3 : 2}>Bins</Title>

        <Button size={isMobile ? "xs" : "sm"} onClick={open}>
          + Add Bin
        </Button>
      </Group>

      {/* 📱 Mobile View */}
      {isMobile ? (
        <Stack>
          {bins.length === 0 ? (
            <Text ta="center" c="dimmed">
              No bins yet
            </Text>
          ) : (
            bins.map((bin, index) => (
              <Card key={bin.id} shadow="sm" radius="md" p="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={600}>{bin.name}</Text>

                    <Text size="xs" c="dimmed">
                      #{index + 1}
                    </Text>

                    {bin.file && (
                      <Text size="xs" c="blue">
                        {bin.file.name}
                      </Text>
                    )}
                  </div>

                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => handleDelete(bin.id)}
                  >
                    <FaTrash size={14} />
                  </ActionIcon>
                </Group>
              </Card>
            ))
          )}
        </Stack>
      ) : (
        /* 💻 Desktop Table */
        <Table.ScrollContainer minWidth={600}>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>Bin Name</Table.Th>
                <Table.Th>File</Table.Th>
                <Table.Th w={80}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {bins.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text ta="center" c="dimmed">
                      No bins added yet
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                bins.map((bin, index) => (
                  <Table.Tr key={bin.id}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{bin.name}</Table.Td>
                    <Table.Td>
                      {bin.file ? bin.file.name : "No file"}
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => handleDelete(bin.id)}
                      >
                        <FaTrash size={14} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      {/* Modal */}
      <Modal opened={opened} onClose={close} title="Add Bin" centered>
        <Stack>
          <TextInput
            label="Bin Name"
            placeholder="Enter bin name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />

          <FileInput
            label="Bin File (optional)"
            placeholder="Upload file"
            value={file}
            onChange={setFile}
            leftSection={<FaUpload size={16} />}
            clearable
          />

          <Group mt="lg" justify="flex-end">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>

            <Button
              onClick={handleAddBin}
              disabled={!name.trim()}
            >
              Add
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}