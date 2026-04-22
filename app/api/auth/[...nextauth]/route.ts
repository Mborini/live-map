import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";

type AppUser = {
  id: string;
  username: string;
  role: number;
};

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET, // ✅ ضروري على Vercel

  providers: [
    CredentialsProvider({
      credentials: {
        username: { type: "text" },
        password: { type: "password" },
      },

      async authorize(credentials) {
        const result = await pool.query(
          "SELECT id, username, password, role FROM users WHERE username = $1",
          [credentials?.username]
        );

        if (result.rows.length === 0) return null;

        const user = result.rows[0];

        if (credentials?.password !== user.password) return null;

        return {
          id: String(user.id),
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as AppUser;
        token.id = u.id;
        token.role = u.role;
        token.username = u.username;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        role: token.role as number,
        username: token.username as string,
      };
      return session;
    },
  },
});
export { handler as GET, handler as POST };