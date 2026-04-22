"use client";

import { signIn } from "next-auth/react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Stack,
  Box,
  Overlay,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
  });

const handleLogin = async (values: typeof form.values) => {
  setLoading(true);

  try {
    await signIn("credentials", {
      username: values.username,
      password: values.password,
      redirect: true,
      callbackUrl: "/dashboard",
    });
  } catch (err) {
    console.error(err);
    notifications.show({
      title: "Error",
      message: "Something went wrong",
      color: "red",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <Box
      style={{
        minHeight: "100vh",
        position: "relative",
        backgroundImage: "url('/toolbg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Overlay color="#000" opacity={0.6} zIndex={1} />

      <Container size={420} style={{ zIndex: 2, width: "100%" }}>
        <Title ta="center" mb="lg" c="white">
          Welcome Back 👋
        </Title>

        <Paper
          shadow="xl"
          p="xl"
          radius="md"
          withBorder
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
          }}
        >
          <form onSubmit={form.onSubmit(handleLogin)}>
            <Stack>
              <TextInput
                label="Username"
                placeholder="Enter username"
                {...form.getInputProps("username")}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter password"
                {...form.getInputProps("password")}
              />

              <Button fullWidth type="submit" loading={loading}>
                Sign in
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}