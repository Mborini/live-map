"use client";

import { useEffect, useState } from "react";
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
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import {
  IconTrash,
  IconUser,
  IconUserOff,
  IconUserCheck,
  IconUserPlus,
  IconKey,
  IconShield,
} from "@tabler/icons-react";

/* ================= TYPES ================= */

type User = {
  id: number;
  name: string;
  role_id: number;
  role_name: string;
  is_active: boolean;
};

/* ================= ROLE COLORS ================= */

const ROLE_COLOR: Record<number, string> = {
  1: "#da77f2", // Admin
  2: "#fab005", // User
  3: "#40c057", // Supervisor
};

const PAGE_SIZE = 5;

/* ================= PAGE ================= */

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  // filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // add user
  const [name, setName] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  // modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [editRoleUser, setEditRoleUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string | null>(null);

  const [opened, { open, close }] = useDisclosure(false);
  const [passOpened, { open: openPass, close: closePass }] =
    useDisclosure(false);

  /* ================= DATA ================= */

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= FILTERING ================= */

  const filteredUsers = users.filter((u) => {
    const matchName = u.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter
      ? String(u.role_id) === roleFilter
      : true;
    return matchName && matchRole;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ================= ACTIONS ================= */

  const handleAddUser = async () => {
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        role: Number(role),
        password,
      }),
    });

    setName("");
    setRole(null);
    setPassword("");
    close();
    fetchUsers();
  };

  const handleToggleActive = async (u: User) => {
    await fetch(`/api/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !u.is_active }),
    });
    fetchUsers();
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;

    await fetch(`/api/users/${selectedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });

    setNewPassword("");
    closePass();
    fetchUsers();
  };

  /* ================= RENDER ================= */

  return (
    <Container size="lg">
      {/* HEADER */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Users Management</Title>
          <Text size="sm" c="dimmed">
            Manage users, roles and access
          </Text>
        </div>

        <Button leftSection={<IconUserPlus size={18} />} onClick={open}>
          Add User
        </Button>
      </Group>

      {/* SEARCH + FILTER */}
      <Group mb="md">
        <TextInput
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          placeholder="Filter by role"
          clearable
          value={roleFilter}
          onChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
          data={[
            { value: "1", label: "Admin" },
            { value: "2", label: "User" },
            { value: "3", label: "Supervisor" },
          ]}
        />
      </Group>

      {/* TABLE */}
      <Card withBorder shadow="sm">
        <Table.ScrollContainer minWidth={700}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th ta="center">#</Table.Th>
                <Table.Th ta="center">User</Table.Th>
                <Table.Th ta="center">Role</Table.Th>
                <Table.Th ta="center">Status</Table.Th>
                <Table.Th ta="center">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {paginatedUsers.map((u, i) => {
                const isAdmin = u.role_id === 1;

                return (
                  <Table.Tr key={u.id}>
                    <Table.Td ta="center">
                      {(page - 1) * PAGE_SIZE + i + 1}
                    </Table.Td>

                    <Table.Td ta="center">
                      <Group justify="center" gap="xs">
                        <IconUser size={16} />
                        <Text fw={500}>{u.name}</Text>
                      </Group>
                    </Table.Td>

                    <Table.Td ta="center">
                      <Badge
                        variant="light"
                        radius="xl"
                        color={ROLE_COLOR[u.role_id]}
                      >
                        {u.role_name}
                      </Badge>
                    </Table.Td>

                    <Table.Td ta="center">
                      <Badge
                        variant="light"
                        color={u.is_active ? "#40c057" : "#fa5252"}
                      >
                        {u.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </Table.Td>

                    {/* ACTIONS */}
                    <Table.Td ta="center">
                      <Group justify="center">
                        <ActionIcon
                          variant="light"
                          disabled={isAdmin}
                          onClick={() => {
                            if (isAdmin) return;
                            handleToggleActive(u);
                          }}
                        >
                          {u.is_active ? (
                            <IconUserOff size={18} />
                          ) : (
                            <IconUserCheck size={18} />
                          )}
                        </ActionIcon>

                        <ActionIcon
                          variant="light"
                          color="#fd7e14"
                          disabled={isAdmin}
                          onClick={() => {
                            if (isAdmin) return;
                            setEditRoleUser(u);
                            setNewRole(String(u.role_id));
                          }}
                        >
                          <IconShield size={18} />
                        </ActionIcon>

                        <ActionIcon
                          variant="light"
                          color="gray"
                          disabled={isAdmin}
                          onClick={() => {
                            if (isAdmin) return;
                            setSelectedUser(u);
                            openPass();
                          }}
                        >
                          <IconKey size={18} />
                        </ActionIcon>

                        <ActionIcon
                          variant="light"
                          color="red"
                          disabled={isAdmin}
                          onClick={() => {
                            if (isAdmin) return;
                            setDeleteUser(u);
                          }}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
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

      {/* ADD USER */}
      <Modal opened={opened} onClose={close} title="Add User" centered>
        <Stack>
          <TextInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Select
            label="Role"
            value={role}
            onChange={setRole}
            data={[
              { value: "1", label: "Admin" },
              { value: "2", label: "User" },
              { value: "3", label: "Supervisor" },
            ]}
          />

          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button onClick={handleAddUser}>Create</Button>
        </Stack>
      </Modal>

      {/* CHANGE PASSWORD */}
      <Modal
        opened={passOpened}
        onClose={closePass}
        title="Change Password"
        centered
      >
        <Stack>
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button onClick={handleChangePassword}>Save</Button>
        </Stack>
      </Modal>

      {/* CHANGE ROLE */}
      <Modal
        opened={!!editRoleUser}
        onClose={() => setEditRoleUser(null)}
        title="Change Role"
        centered
      >
        <Stack>
          <Select
            label="Role"
            value={newRole}
            onChange={setNewRole}
            data={[
              { value: "1", label: "Admin" },
              { value: "2", label: "User" },
              { value: "3", label: "Supervisor" },
            ]}
          />
          <Button
            onClick={async () => {
              if (!editRoleUser || !newRole) return;
              await fetch(`/api/users/${editRoleUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: Number(newRole) }),
              });
              setEditRoleUser(null);
              fetchUsers();
            }}
          >
            Save
          </Button>
        </Stack>
      </Modal>

      {/* DELETE CONFIRM */}
      <Modal
        opened={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        title="Confirm Delete"
        centered
      >
        <Text>
          Are you sure you want to delete <b>{deleteUser?.name}</b> ?
        </Text>

        <Group mt="md">
          <Button variant="default" onClick={() => setDeleteUser(null)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={async () => {
              if (!deleteUser) return;
              await fetch(`/api/users/${deleteUser.id}`, {
                method: "DELETE",
              });
              setDeleteUser(null);
              fetchUsers();
            }}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}