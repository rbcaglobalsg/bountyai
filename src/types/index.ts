import type { DefaultSession } from "next-auth";

// Manually defining these since prisma generate might fail due to file locks
export enum Plan {
  FREE = "FREE",
  PRO = "PRO",
  ELITE = "ELITE",
}

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    plan: Plan;
    githubUsername?: string | null;
    password?: string | null;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      plan: Plan;
      githubUsername?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    plan: Plan;
    githubUsername?: string | null;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    role: Role;
    plan: Plan;
    githubUsername?: string | null;
    password?: string | null;
  }
}
