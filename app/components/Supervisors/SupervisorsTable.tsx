"use client";

import {
  Table,
  Button,
  Badge,
  Paper,
  Text,
  Divider,
  Group,
  Title,
} from "@mantine/core";

type Supervisor = {
  id: number;
  name: string;
  phone: string;
  active: boolean;
  shift: number;
};

type Props = {
  data: Supervisor[];
  onToggle: (id: number, active: boolean) => void;
  onAddClick: () => void;
};

export default function SupervisorsTable({
  data,
  onToggle,
  onAddClick,
}: Props) {
  return (
    <Paper p="lg" withBorder radius="md" shadow="sm">
      {/* HEADER */}
      <Group justify="space-between" mb="md">
        <Title order={4}>Supervisors List</Title>

        <Button size="xs" onClick={onAddClick}>
          Add
        </Button>
      </Group>

      {/* TABLE */}
      <Table striped highlightOnHover verticalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Phone</Table.Th>
            
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {data.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Text ta="center" c="dimmed" py="xl">
                  No supervisors found
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            data.map((s) => (
              <Table.Tr key={s.id}>
                <Table.Td fw={500}>{s.name}</Table.Td>
                <Table.Td c="dimmed">{s.phone}</Table.Td>
                

               

                
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      {/* FOOTER */}
      <Divider mt="md" mb="xs" />

      <Text size="xs" c="dimmed">
        Total: {data.length}
      </Text>
    </Paper>
  );
}
