"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Box,
  Stack,
  Avatar,
  Text,
  Tooltip,
  UnstyledButton,
  Center,
  Loader,
} from "@mantine/core";
import {
  IconMap,
  IconAlertCircle,
  IconHistory,
  IconUsers,
  IconRoute,
  IconTrash,
  IconReportAnalytics,
  IconSettings,
  IconLogout,
  IconPolygon
} from "@tabler/icons-react";
import classes from "./NavbarMinimal.module.css";
interface NavLinkProps {
  icon: any;
  label: string;
  href?: string;
  onClick?: () => void;
}

function NavLink({ icon: Icon, label, href, onClick }: NavLinkProps) {
  const content = (
    <UnstyledButton className={classes.link} onClick={onClick}>
      <Icon size={22} stroke={1.5} />
    </UnstyledButton>
  );

  return (
    <Tooltip label={label} position="right">
      {href ? <Link href={href}>{content}</Link> : content}
    </Tooltip>
  );
}

export default function AppSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Center h="100dvh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!session) {
    return (
      <Center h="100dvh">
        <UnstyledButton onClick={() => signIn()}>
          Login
        </UnstyledButton>
      </Center>
    );
  }

  return (
    <Box className={classes.wrapper}>
      {/* Sidebar */}
      <nav className={classes.navbar}>
        <Stack align="center" mb="xl">
          <Avatar src={session.user?.image ?? ""} radius="xl" />
          <Text size="xs" ta="center">
            {session.user?.name}
          </Text>
        </Stack>

        <Stack gap={6} className={classes.navbarMain}>
          <NavLink icon={IconMap} label="Map" href="/map" />
          <NavLink icon={IconAlertCircle} label="Complaints" href="/complaints" />
       
          <NavLink icon={IconPolygon} label="Zones" href="/zones" />
          <NavLink icon={IconHistory} label="History" href="/FollowupsPage" />
          <NavLink icon={IconTrash} label="Bins" href="/bins" />
          <NavLink icon={IconRoute} label="Routes" href="/routes" />
          <NavLink icon={IconUsers} label="Users" href="/users" />

          {session.user?.role === 1 && (
            <NavLink
              icon={IconReportAnalytics}
              label="Reports"
              href="/reports"
            />
          )}
        </Stack>

        <Stack gap={6} mt="auto">
          <NavLink icon={IconSettings} label="Settings" href="/settings" />
          <NavLink
            icon={IconLogout}
            label="Logout"
            onClick={() => signOut({ callbackUrl: "/login" })}
          />
        </Stack>
      </nav>

      {/* Content */}
      <Box className={classes.content}>{children}</Box>
    </Box>
  );
}