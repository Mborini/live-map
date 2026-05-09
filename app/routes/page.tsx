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
import { useDisclosure } from "@mantine/hooks";
import {
  IconTrash,
  IconUpload,
  IconRoute,
  IconUserPlus,
} from "@tabler/icons-react";

type Route = {
  id: number;
  name: string;
  file?: File | null;
};

const PAGE_SIZE = 5;

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);

  const [opened, { open, close }] = useDisclosure(false);

  /* ================= ACTIONS ================= */

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

  const handleDelete = (id: number) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  /* ================= PAGINATION ================= */

  const totalPages = Math.max(1, Math.ceil(routes.length / PAGE_SIZE));
  const paginatedRoutes = routes.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ================= RENDER ================= */

  return (
    <Container size="lg">
      {/* HEADER */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Routes Management</Title>
          <Text size="sm" c="dimmed">
            Manage routes and uploaded files
          </Text>
        </div>

        <Button
          leftSection={<IconUserPlus size={18} />}
          onClick={open}
        >
          Add Route
        </Button>
      </Group>

      {/* TABLE */}
      <Card withBorder shadow="sm">
        <Table.ScrollContainer minWidth={700}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th ta="center">#</Table.Th>
                <Table.Th ta="center">Route</Table.Th>
                <Table.Th ta="center">File</Table.Th>
                <Table.Th ta="center">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {paginatedRoutes.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text ta="center" c="dimmed">
                      No routes added yet
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                paginatedRoutes.map((route, i) => (
                  <Table.Tr key={route.id}>
                    {/* INDEX */}
                    <Table.Td ta="center">
                      {(page - 1) * PAGE_SIZE + i + 1}
                    </Table.Td>

                    {/* NAME */}
                    <Table.Td ta="center">
                      <Group justify="center" gap="xs">
                        <IconRoute size={16} />
                        <Text fw={500}>{route.name}</Text>
                      </Group>
                    </Table.Td>

                    {/* FILE */}
                    <Table.Td ta="center">
                      {route.file ? (
                        <Text size="sm">{route.file.name}</Text>
                      ) : (
                        <Text size="sm" c="dimmed">
                          No file
                        </Text>
                      )}
                    </Table.Td>

                    {/* ACTIONS */}
                    <Table.Td ta="center">
                      <Group justify="center">
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => handleDelete(route.id)}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>

      {/* PAGINATION */}
      <Group justify="center" mt="md">
        <Button
          size="xs"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </Button>

        <Text>
          Page {page} / {totalPages}
        </Text>

        <Button
          size="xs"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </Group>

      {/* ADD ROUTE MODAL */}
      <Modal opened={opened} onClose={close} title="Add Route" centered>
        <Stack>
          <TextInput
            label="Route Name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />

          <FileInput
            label="Route File (KML / KMZ)"
            value={file}
            onChange={setFile}
            accept=".kml,.kmz"
            leftSection={<IconUpload size={16} />}
            clearable
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>
            <Button disabled={!name.trim()} onClick={handleAddRoute}>
              Add
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}