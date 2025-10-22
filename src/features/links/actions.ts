"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { link } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { createLinkSchema, updateLinkSchema } from "./schema";

/**
 * Link Server Actions
 *
 * All actions include:
 * - Authentication check
 * - Input validation (Zod)
 * - Authorization (user owns the link)
 * - Revalidation (cache invalidation)
 */

// ============================================================================
// CREATE LINK
// ============================================================================

/**
 * Create a new link between two entities
 *
 * @param input - Link data (validated against createLinkSchema)
 * @returns Created link object
 */
export async function createLink(input: unknown) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to create links");
  }

  // 2. Validate input
  const data = createLinkSchema.parse(input);

  // 3. Check for duplicate link
  const existingLink = await db.query.link.findFirst({
    where: and(
      eq(link.userId, session.user.id),
      eq(link.fromType, data.fromType),
      eq(link.fromId, data.fromId),
      eq(link.toType, data.toType),
      eq(link.toId, data.toId),
      eq(link.relationship, data.relationship)
    ),
  });

  if (existingLink) {
    throw new Error("This link already exists");
  }

  // 4. Validate that from and to are different
  if (data.fromType === data.toType && data.fromId === data.toId) {
    throw new Error("Cannot link an entity to itself");
  }

  // 5. Create link
  const [newLink] = await db
    .insert(link)
    .values({
      fromType: data.fromType,
      fromId: data.fromId,
      toType: data.toType,
      toId: data.toId,
      relationship: data.relationship,
      metadata: data.metadata || {},
      userId: session.user.id,
    })
    .returning();

  // 6. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${data.fromType}s/${data.fromId}`);
  revalidatePath(`/dashboard/${data.toType}s/${data.toId}`);

  return { success: true, link: newLink };
}

// ============================================================================
// UPDATE LINK
// ============================================================================

/**
 * Update an existing link
 *
 * @param id - Link ID
 * @param input - Partial link data (validated against updateLinkSchema)
 * @returns Updated link object
 */
export async function updateLink(id: string, input: unknown) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to update links");
  }

  // 2. Validate input
  const data = updateLinkSchema.parse(input);

  // 3. Check ownership
  const existingLink = await db.query.link.findFirst({
    where: and(eq(link.id, id), eq(link.userId, session.user.id)),
  });

  if (!existingLink) {
    throw new Error("Link not found or you don't have permission to update it");
  }

  // 4. Update link
  const [updatedLink] = await db
    .update(link)
    .set({
      relationship: data.relationship,
      metadata: data.metadata !== undefined ? data.metadata : existingLink.metadata,
    })
    .where(eq(link.id, id))
    .returning();

  // 5. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${existingLink.fromType}s/${existingLink.fromId}`);
  revalidatePath(`/dashboard/${existingLink.toType}s/${existingLink.toId}`);

  return { success: true, link: updatedLink };
}

// ============================================================================
// DELETE LINK
// ============================================================================

/**
 * Delete a link
 *
 * @param id - Link ID
 */
export async function deleteLink(id: string) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to delete links");
  }

  // 2. Check ownership
  const existingLink = await db.query.link.findFirst({
    where: and(eq(link.id, id), eq(link.userId, session.user.id)),
  });

  if (!existingLink) {
    throw new Error("Link not found or you don't have permission to delete it");
  }

  // 3. Delete link
  await db.delete(link).where(eq(link.id, id));

  // 4. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${existingLink.fromType}s/${existingLink.fromId}`);
  revalidatePath(`/dashboard/${existingLink.toType}s/${existingLink.toId}`);

  return { success: true };
}
