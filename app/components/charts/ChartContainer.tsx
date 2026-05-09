"use client";

import { Card, Text } from "@mantine/core";

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}

export function ChartContainer({ title, children }: ChartContainerProps) {
  return (
    <Card shadow="sm" radius="lg" p="md">
      <Text fw={600} mb="sm">
        {title}
      </Text>
      {children}
    </Card>
  );
}