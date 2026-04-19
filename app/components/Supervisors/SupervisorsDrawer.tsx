"use client";

import { useEffect, useState } from "react";
import { Drawer, Button, TextInput, Stack, Select } from "@mantine/core";
import { getShifts } from "@/lib/services/shiftsService";
import type { Shift } from "@/lib/types/shiftTypes";

type Props = {
  opened: boolean;
  onClose: () => void;
  onAdd: (name: string, phone: string, shift: number) => void;
};

export default function SupervisorDrawer({ opened, onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [shift, setShift] = useState<string | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);


  useEffect(() => {

    const loadShifts = async () => {
      try {
        const fetchedShifts = await getShifts();
       
          setShifts(fetchedShifts);
      } catch (err) {
        console.error("Error loading shifts:", err);
      }
    };

    loadShifts();
console.log("Loaded shifts:", shifts);
    
  }, []);

  const handleAdd = () => {
    if (!name.trim() || !shift) return;

    onAdd(name, phone, Number(shift));
    setShift(null);
    setName("");
    setPhone("");
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Add Supervisor"
      position="right"
      size="xs" // 👈 هون صغرنا العرض فعلياً
      padding="md"
    >
      <Stack>
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <TextInput
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.currentTarget.value)}
        />
        <Select
          label="Shift"
          value={shift}
          onChange={(value) => setShift(value || null)}
          placeholder="Pick one"
          clearable
          data={shifts.map((item) => ({
            value: String(item.id),
            label: item.name,
          }))}
        />

        <Button fullWidth onClick={handleAdd}>
          Save
        </Button>

        <Button variant="light" color="red" onClick={onClose}>
          Close
        </Button>
      </Stack>
    </Drawer>
  );
}
