"use client";

import { useEffect, useState } from "react";
import { Button, Container, Group, Title } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { binService } from "@/lib/services/binService";
import { Bin } from "@/lib/types/bin";
import { AddBinModal } from "../components/bins/AddBinModal";
import { BinTable } from "../components/bins/BinTable";


export default function BinsPage() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [opened, { open, close }] = useDisclosure();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const loadBins = async () => {
    const data = await binService.getAll();
    setBins(data);
  };

  useEffect(() => {
    loadBins();
  }, []);

  return (
    <Container>
      <Group justify="space-between" mb="md">
        <Title>Bins</Title>
        <Button onClick={open}>+ Add Bin</Button>
      </Group>

      <BinTable bins={bins} onDelete={async (id) => {
        await binService.delete(id);
        loadBins();
      }} />

      <AddBinModal
        opened={opened}
        onClose={close}
        onSubmit={async (name, file) => {
          await binService.create(name, file);
          close();
          loadBins();
        }}
      />
    </Container>
  );
}
