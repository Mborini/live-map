import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";

type AppUser = {
  id: string;
  username: string;
  role: number;
};

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        username: { type: "text" },
        password: { type: "password" },
      },

    async authorize(credentials) {
  console.log("🔵 LOGIN INPUT:", credentials);

  const result = await pool.query(
    "SELECT id, username, password, role FROM users WHERE username = $1",
    [credentials?.username]
  );

  console.log("🟡 DB RESULT:", result.rows);

  if (result.rows.length === 0) {
    console.log("❌ USER NOT FOUND");
    return null;
  }

  const user = result.rows[0];

  console.log("🟢 USER FROM DB:", user);

  console.log("🔐 PASSWORD CHECK:", {
    input: credentials?.password,
    db: user.password,
  });

  if (credentials?.password !== user.password) {
    console.log("❌ WRONG PASSWORD");
    return null;
  }

  console.log("✅ LOGIN SUCCESS");
  return {
    id: String(user.id),
    username: user.username,
    role: user.role,
  };
}
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as AppUser;
        token.role = u.role;
        token.username = u.username;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role as number;
      session.user.username = token.username as string;
      return session;
    },
  },
});

export { handler as GET, handler as POST };