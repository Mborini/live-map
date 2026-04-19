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
  Select,
  PasswordInput,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { FaTrash, FaUserPlus } from "react-icons/fa";

type User = {
  id: number;
  name: string;
  role: string;
  password: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [opened, { open, close }] = useDisclosure(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  // ➕ Add User
  const handleAddUser = () => {
    if (!name.trim() || !role || !password.trim()) return;

    const newUser: User = {
      id: Date.now(),
      name: name.trim(),
      role,
      password,
    };

    setUsers((prev) => [...prev, newUser]);

    setName("");
    setRole(null);
    setPassword("");
    close();
  };

  // ❌ Delete
  const handleDelete = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <Container size="lg" py="md">
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Title order={isMobile ? 3 : 2}>Users</Title>

        <Button leftSection={<FaUserPlus />} onClick={open}>
          Add User
        </Button>
      </Group>

      {/* 📱 Mobile */}
      {isMobile ? (
        <Stack>
          {users.length === 0 ? (
            <Text ta="center" c="dimmed">
              No users yet
            </Text>
          ) : (
            users.map((user, index) => (
              <Card key={user.id} shadow="sm" radius="md" p="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={600}>{user.name}</Text>

                    <Text size="xs" c="dimmed">
                      Role: {user.role}
                    </Text>

                    <Text size="xs" c="dimmed">
                      Password: {"•".repeat(6)}
                    </Text>

                    <Text size="xs" c="dimmed">
                      #{index + 1}
                    </Text>
                  </div>

                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => handleDelete(user.id)}
                  >
                    <FaTrash size={14} />
                  </ActionIcon>
                </Group>
              </Card>
            ))
          )}
        </Stack>
      ) : (
        /* 💻 Desktop */
        <Table.ScrollContainer minWidth={600}>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Password</Table.Th>
                <Table.Th w={80}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {users.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text ta="center" c="dimmed">
                      No users added yet
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                users.map((user, index) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{user.name}</Table.Td>
                    <Table.Td>{user.role}</Table.Td>
                    <Table.Td>{"••••••••"}</Table.Td>
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => handleDelete(user.id)}
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
      <Modal opened={opened} onClose={close} title="Add User" centered>
        <Stack>
          <TextInput
            label="User Name"
            placeholder="Enter user name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />

          <Select
            label="Role"
            placeholder="Select role"
            data={["Admin", "Manager", "User"]}
            value={role}
            onChange={setRole}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />

          <Group mt="lg" justify="flex-end">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>

            <Button
              onClick={handleAddUser}
              disabled={!name.trim() || !role || !password}
            >
              Add
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}