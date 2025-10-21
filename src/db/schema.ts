import { pgTable, text, bigint, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";

// ============================================
// AUTHENTICATION TABLES (Better Auth)
// ============================================
// Generated with: npx @better-auth/cli generate
// Naming convention: snake_case for all columns (PostgreSQL best practice)

/**
 * User role enum for RBAC system
 *
 * Roles hierarchy:
 * - user: Basic authenticated user (default)
 * - admin: Full system access (can manage users and system settings)
 *
 * See docs/RBAC.md for complete permission mapping
 */
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

/**
 * User table (managed by Better Auth)
 *
 * Core authentication table with user credentials and profile information.
 * Better Auth automatically manages authentication flows (sign up, sign in, password reset).
 *
 * Custom fields:
 * - role: RBAC role (user/admin) - managed via Better Auth additionalFields
 *
 * Relations:
 * - sessions: Active user sessions
 * - accounts: OAuth provider accounts (if using social login)
 *
 * Security notes:
 * - Passwords hashed with PBKDF2 (100k iterations) via custom implementation
 * - role field has input: false (can't be set on sign up, must be changed by admin)
 *
 * @see docs/AUTHENTICATION.md for auth system details
 * @see docs/RBAC.md for role management
 */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  role: userRoleEnum("role").default("user").notNull(),
});

/**
 * Session table (managed by Better Auth)
 *
 * Tracks active user sessions with JWT tokens.
 * Better Auth automatically handles session expiration and renewal.
 *
 * Security features:
 * - HttpOnly cookies (XSS protection)
 * - 5-minute cookie cache for performance
 * - IP address and user agent tracking for security auditing
 *
 * Session lifecycle:
 * 1. Created on successful sign in
 * 2. Token stored in HttpOnly cookie
 * 3. Automatically cleaned up on expiration
 * 4. Cascade deleted when user is deleted
 */
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

/**
 * Account table (managed by Better Auth)
 *
 * Stores OAuth provider accounts linked to users.
 * Supports multiple providers per user (e.g., GitHub + Google).
 *
 * Provider support:
 * - Email/password (stored in account.password field)
 * - OAuth providers (GitHub, Google, etc.) - tokens stored here
 *
 * Token management:
 * - access_token: OAuth access token
 * - refresh_token: OAuth refresh token (for token renewal)
 * - Token expiration tracked for automatic renewal
 *
 * Security:
 * - Cascade delete when user is removed
 * - Tokens encrypted at rest (database-level encryption recommended)
 */
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Verification table (managed by Better Auth)
 *
 * Stores verification tokens for:
 * 1. Email verification (on sign up)
 * 2. Password reset requests
 *
 * Token lifecycle:
 * - Created when verification email is sent
 * - Single-use (deleted after successful verification)
 * - Expires after configured time (default: 1 hour for password reset)
 *
 * Security:
 * - Cryptographically random tokens
 * - Time-limited expiration
 * - Automatic cleanup of expired tokens
 *
 * @see src/lib/emails/auth-emails.ts for email sending
 */
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Rate Limit table (managed by Better Auth)
 *
 * Database-backed rate limiting for edge compatibility.
 * Prevents brute force attacks and API abuse.
 *
 * Configuration (src/lib/auth.ts):
 * - window: 60 seconds
 * - max: 100 requests per window
 * - storage: "database" (works in Cloudflare Workers)
 *
 * Why database storage:
 * - Edge-compatible (no in-memory state needed)
 * - Distributed rate limiting across multiple workers
 * - Persistent across deployments
 *
 * Performance:
 * - Indexed on 'key' for fast lookups
 * - Automatic cleanup of old entries
 */
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key"),
  count: integer("count"),
  lastRequest: bigint("last_request", { mode: "number" }),
});

// ============================================
// PLANNERINATOR TABLES
// ============================================
// Following same snake_case convention for consistency
// Schema will be added during development

// TODO: Add Plannerinator schema tables:
// - tasks
// - events
// - notes
// - projects
// - collections
// - collection_items
// - links
// - tags
// - entity_tags
// - comments
// - attachments (future)
// - activity_log
// - shares (future)
