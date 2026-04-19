"use client";

import { SessionProvider } from "next-auth/react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <MantineProvider defaultColorScheme="light">
        <Notifications />
        {children}
      </MantineProvider>
    </SessionProvider>
  );
}