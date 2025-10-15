// next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Role } from "@prisma/client"; // Import your Role enum

// Extend the default types for User
interface User extends DefaultUser {
  role: Role;
}

declare module "next-auth" {
  // Extend the Session interface
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  // --- THIS IS THE CRITICAL FIX ---
  // Extend the JWT interface to include the role and id
  interface JWT {
    id: string;
    role: Role;
  }
}