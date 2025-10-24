import { db } from "@/db";
import { account, rateLimit, session, user, verification } from "@/db/schema";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/emails/auth-emails";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { AppSession } from "@/types/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "mock";

/**
 * Better Auth configuration
 *
 * Features:
 * - Email/password authentication with custom PBKDF2 hashing (Cloudflare Workers compatible)
 * - Email verification (enabled automatically when EMAIL_PROVIDER="resend")
 * - Password reset built-in
 * - Rate limiting with database storage (edge-compatible)
 * - Custom 'role' field for RBAC (user/editor/admin)
 * - Next.js cookies integration
 */
export const auth = betterAuth({
  // Database adapter with explicit schema tables
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL (Neon)
    schema: {
      user,
      session,
      account,
      verification,
      rateLimit,
    },
  }),

  // Base URL
  baseURL: BETTER_AUTH_URL,

  // Secret for JWT signing
  secret: process.env.BETTER_AUTH_SECRET!,

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    // Email verification enabled only when real email provider is configured
    // In development (mock mode), verification is disabled for better DX
    requireEmailVerification: EMAIL_PROVIDER === "resend",
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { name: string; email: string };
      url: string;
    }) => {
      await sendVerificationEmail({ user, url });
    },
    sendResetPassword: async ({
      user,
      url,
    }: {
      user: { name: string; email: string };
      url: string;
    }) => {
      await sendPasswordResetEmail({ user, url });
    },
    // Custom password hashing (PBKDF2 with Web Crypto API for Cloudflare Workers)
    password: {
      hash: async (password: string) => {
        return await hashPassword(password);
      },
      verify: async ({ password, hash }: { password: string; hash: string }) => {
        return await verifyPassword(password, hash);
      },
    },
  },

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes cache
    },
  },

  // Custom user fields (for RBAC)
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
        input: false, // Don't allow setting role on sign up (security)
      },
    },
  },

  // Rate limiting (database storage for Cloudflare Workers)
  rateLimit: {
    enabled: true,
    window: 60, // 60 seconds
    max: 100, // 100 requests per window
    storage: "database", // Use database for edge compatibility
  },

  // Plugins
  plugins: [
    nextCookies(), // Next.js cookies integration
  ],
});

/**
 * Type-safe session helper for server components and actions.
 *
 * This wrapper ensures that the session.user.role field is correctly typed
 * as our app's Role type ("user" | "admin") instead of Better Auth's inferred type.
 *
 * The cast is safe because:
 * - The role field is validated by PostgreSQL enum constraint in the database
 * - Better Auth loads role from the database which enforces the enum
 * - We never allow setting role directly (input: false in config)
 *
 * @returns AppSession with properly typed role field, or null if not authenticated
 *
 * @example
 * const session = await getSession();
 * if (session) {
 *   const role: "user" | "admin" = session.user.role; // ✅ Type-safe!
 * }
 */
export async function getSession(): Promise<AppSession | null> {
  const { headers } = await import("next/headers");
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return null;

  // Safe cast: role is validated by database enum constraint
  return session as AppSession;
}
