"use client";

import { useEffect, useState } from "react";
import { Stack } from "@mantine/core";

import SupervisorDrawer from "../components/Supervisors/SupervisorsDrawer";
import SupervisorsTable from "../components/Supervisors/SupervisorsTable";

type Supervisor = {
  id: number;
  name: string;
  phone: string;
  active: boolean;
  shift: number;
};

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [opened, setOpened] = useState(false);

  const load = async () => {
    const res = await fetch("/api/supervisors");
    const data = await res.json();
    setSupervisors(data);
  };

  useEffect(() => {
    load();
  }, []);

  const addSupervisor = async (name: string, phone: string, shift: number) => {
    await fetch("/api/supervisors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, shift }),
    });

    load();
  };

  const toggle = async (id: number, active: boolean) => {
    await fetch("/api/supervisors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });

    load();
  };

  return (
    <Stack p="lg" gap="md">
      <SupervisorDrawer
        opened={opened}
        onClose={() => setOpened(false)}
        onAdd={addSupervisor}
      />

      <SupervisorsTable
        data={supervisors}
        onToggle={toggle}
        onAddClick={() => setOpened(true)}   // 👈 مهم
      />
    </Stack>
  );
}

