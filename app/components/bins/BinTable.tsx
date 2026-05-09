import { Bin } from "@/lib/types/bin";
import { Table, ActionIcon, Text, Group, Card } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

type Props = {
  bins: Bin[];
  onDelete: (id: number) => void;
};

export function BinTable({ bins, onDelete }: Props) {
  return (
    <Card withBorder shadow="sm">
      <Table.ScrollContainer minWidth={700}>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th ta="center">#</Table.Th>
              <Table.Th ta="center">Name</Table.Th>
              <Table.Th ta="center">Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {bins.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text ta="center" c="dimmed">
                    No bins yet
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              bins.map((bin, i) => (
                <Table.Tr key={bin.id}>
                  {/* INDEX */}
                  <Table.Td ta="center">{i + 1}</Table.Td>

                  {/* NAME */}
                  <Table.Td ta="center">
                    <Text fw={500}>{bin.name}</Text>
                  </Table.Td>

                  {/* ACTIONS */}
                  <Table.Td ta="center">
                    <Group justify="center">
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => onDelete(bin.id)}
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
  );
}