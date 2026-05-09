"use client";

import { SimpleGrid, Card, Text, Group, Stack } from "@mantine/core";
import { IconAlertCircle, IconChartBar } from "@tabler/icons-react";

import { LineChartComponent } from "../components/charts/LineChartComponent";
import { BarChartComponent } from "../components/charts/BarChartComponent";
import { ChartContainer } from "../components/charts/ChartContainer";

/* ✅ Example Data */
const lineData = [
  { name: "Jan", value: 12 },
  { name: "Feb", value: 19 },
  { name: "Mar", value: 7 },
  { name: "Apr", value: 14 },
];

const barData = [
  { name: "Zone A", value: 32 },
  { name: "Zone B", value: 18 },
  { name: "Zone C", value: 25 },
];

export default function DashboardPage() {
  return (
    <Stack gap="lg">
      {/* 🔹 KPI CARDS */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
        <KpiCard
          title="Total Complaints"
          value="124"
          icon={<IconAlertCircle size={18} />}
        />
        <KpiCard
          title="Resolved"
          value="96"
          icon={<IconChartBar size={18} />}
        />
        <KpiCard title="Pending" value="18" />
        <KpiCard title="Critical" value="10" />
      </SimpleGrid>

      {/* 🔸 CHARTS */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <ChartContainer title="Complaints Trend">
          <LineChartComponent data={lineData} xKey="name" yKey="value" />
        </ChartContainer>

        <ChartContainer title="Complaints by Zone">
          <BarChartComponent data={barData} xKey="name" yKey="value" />
        </ChartContainer>
      </SimpleGrid>
    </Stack>
  );
}

/* ✅ KPI CARD COMPONENT */
function KpiCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card shadow="sm" radius="lg" p="md">
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {title}
        </Text>
        {icon}
      </Group>

      <Text size="xl" fw={700} mt={4}>
        {value}
      </Text>
    </Card>
  );
}
