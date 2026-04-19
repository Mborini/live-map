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

type Route = {
  id: number;
  name: string;
  file?: File | null;
};

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  // ➕ Add Route
  const handleAddRoute = () => {
    if (!name.trim()) return;

    const newRoute: Route = {
      id: Date.now(),
      name: name.trim(),
      file,
    };

    setRoutes((prev) => [...prev, newRoute]);

    setName("");
    setFile(null);
    close();
  };

  // ❌ Delete
  const handleDelete = (id: number) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <Container size="lg" py="md">
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Title order={isMobile ? 3 : 2}>Routes</Title>

        <Button size={isMobile ? "xs" : "sm"} onClick={open}>
          + Add Route
        </Button>
      </Group>

      {/* 📱 Mobile View */}
      {isMobile ? (
        <Stack>
          {routes.length === 0 ? (
            <Text ta="center" c="dimmed">
              No routes yet
            </Text>
          ) : (
            routes.map((route, index) => (
              <Card key={route.id} shadow="sm" radius="md" p="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={600}>{route.name}</Text>

                    <Text size="xs" c="dimmed">
                      #{index + 1}
                    </Text>

                    {route.file && (
                      <Text size="xs" c="blue">
                        {route.file.name}
                      </Text>
                    )}
                  </div>

                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => handleDelete(route.id)}
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
                <Table.Th>Route Name</Table.Th>
                <Table.Th>File</Table.Th>
                <Table.Th w={80}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {routes.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text ta="center" c="dimmed">
                      No routes added yet
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                routes.map((route, index) => (
                  <Table.Tr key={route.id}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{route.name}</Table.Td>
                    <Table.Td>
                      {route.file ? route.file.name : "No file"}
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => handleDelete(route.id)}
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
      <Modal opened={opened} onClose={close} title="Add Route" centered>
        <Stack>
          <TextInput
            label="Route Name"
            placeholder="Enter route name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />

          <FileInput
            label="Route File (KML / KMZ)"
            placeholder="Upload file"
            value={file}
            onChange={setFile}
            accept=".kml,.kmz"
            leftSection={<FaUpload size={16} />}
            clearable
          />

          <Group mt="lg" justify="flex-end">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>

            <Button
              onClick={handleAddRoute}
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