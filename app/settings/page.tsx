"use client";

import { signOut, useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Settings ⚙️</h1>

      <p>{session?.user?.name}</p>

      <button
        className="bg-red-500 text-white px-4 py-2 rounded"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Logout
      </button>
    </div>
  );
}