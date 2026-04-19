"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Center,
  Loader,
  Button,
  Box,
  Paper,
  Group,
  Avatar,
  Text,
  Stack,
} from "@mantine/core";

export default function Dashboard() {
  const { data: session, status } = useSession();

  // ⏳ Loading
  if (status === "loading") {
    return (
      <Center h="100dvh">
        <Loader size="lg" />
      </Center>
    );
  }

  // ❌ Not logged in
  if (!session) {
    return (
      <Center h="100dvh">
        <Button onClick={() => signIn()} size="md">
          Go Login
        </Button>
      </Center>
    );
  }

  return (
    <Box
      style={{
        position: "relative",
        height: "100dvh",
        overflow: "hidden",
        backgroundImage: "url('/toolbg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* overlay */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
        }}
      />

      {/* 👤 Top User Bar */}
      <Group
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 10,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: "999px",
          padding: "6px 10px",
        }}
        gap="xs"
      >
        <Avatar src={session.user?.image || ""} radius="xl" size="sm" />

        <Text size="sm" fw={600}>
          {session.user?.name || "User"}
        </Text>

        <Button
          onClick={() => signOut({ callbackUrl: "/login" })}
          size="xs"
          color="red"
          radius="xl"
          variant="light"
        >
          Logout
        </Button>
      </Group>

      {/* 🎯 Center Menu */}
      <Center style={{ height: "100%", position: "relative", zIndex: 5 }}>
        <Paper
          shadow="xl"
          p="xl"
          radius="xl"
          style={{
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255,255,255,0.1)",
            minWidth: 300,
          }}
        >
          <Stack>
            <Button component={Link} href="/map" size="lg" radius="xl">
              🗺️ Map
            </Button>
            <Button component={Link} href="/zones" size="lg" radius="xl">
             Zones
            </Button>
            <Button component={Link} href="/supervisors" size="lg" radius="xl">
             supervisors
            </Button>

        
             <Button component={Link} href="/reports" size="lg" radius="xl">
              📊 Reports
            </Button>
          
           

            <Button component={Link} href="/bins" size="lg" radius="xl">
              Bins
            </Button>

            <Button component={Link} href="/routes" size="lg" radius="xl">
              Routes
            </Button>

            <Button component={Link} href="/users" size="lg" radius="xl">
              Users
            </Button>

            <Button
              component={Link}
              href="/settings"
              size="lg"
              radius="xl"
              color="dark"
            >
              Settings
            </Button>
          </Stack>
        </Paper>
      </Center>
    </Box>
  );
}