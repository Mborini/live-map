import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: number;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    username: string;
    role: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: number;
  }
}
