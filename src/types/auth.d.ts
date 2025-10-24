/**
 * Type definitions for Better Auth with custom role field.
 */

// Define custom role type
export type Role = "user" | "admin";

/**
 * App User type with all fields from Better Auth
 *
 * Better Auth infers role from runtime config, but we want strict typing.
 * We explicitly define all fields to ensure type safety.
 */
export interface AppUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
}

/**
 * App Session type
 */
export interface AppSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  user: AppUser;
}

// Module augmentation for Better Auth (for compatibility)
declare module "better-auth/types" {
  interface User {
    role: Role;
  }
}
