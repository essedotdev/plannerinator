"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { comment } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { createCommentSchema, updateCommentSchema } from "./schema";

/**
 * Comment Server Actions
 *
 * All actions include:
 * - Authentication check
 * - Input validation (Zod)
 * - Authorization (user owns the comment for edit/delete)
 * - Revalidation (cache invalidation)
 */

// ============================================================================
// CREATE COMMENT
// ============================================================================

/**
 * Create a new comment on an entity
 *
 * @param input - Comment data (validated against createCommentSchema)
 * @returns Created comment object
 */
export async function createComment(input: unknown) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to create comments");
  }

  // 2. Validate input
  const data = createCommentSchema.parse(input);

  // 3. If replying to a comment, verify parent exists and belongs to same entity
  if (data.parentCommentId) {
    const parentComment = await db.query.comment.findFirst({
      where: eq(comment.id, data.parentCommentId),
    });

    if (!parentComment) {
      throw new Error("Parent comment not found");
    }

    // Verify parent belongs to same entity
    if (parentComment.entityType !== data.entityType || parentComment.entityId !== data.entityId) {
      throw new Error("Parent comment belongs to a different entity");
    }
  }

  // 4. Create comment
  const [newComment] = await db
    .insert(comment)
    .values({
      content: data.content,
      entityType: data.entityType,
      entityId: data.entityId,
      parentCommentId: data.parentCommentId,
      userId: session.user.id,
    })
    .returning();

  // 5. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${data.entityType}s/${data.entityId}`);

  return { success: true, comment: newComment };
}

// ============================================================================
// UPDATE COMMENT
// ============================================================================

/**
 * Update an existing comment
 *
 * @param id - Comment ID
 * @param input - Partial comment data (validated against updateCommentSchema)
 * @returns Updated comment object
 */
export async function updateComment(id: string, input: unknown) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to update comments");
  }

  // 2. Validate input
  const data = updateCommentSchema.parse(input);

  // 3. Check ownership
  const existingComment = await db.query.comment.findFirst({
    where: and(eq(comment.id, id), eq(comment.userId, session.user.id)),
  });

  if (!existingComment) {
    throw new Error("Comment not found or you don't have permission to update it");
  }

  // 4. Update comment
  const [updatedComment] = await db
    .update(comment)
    .set({
      content: data.content,
    })
    .where(eq(comment.id, id))
    .returning();

  // 5. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${existingComment.entityType}s/${existingComment.entityId}`);

  return { success: true, comment: updatedComment };
}

// ============================================================================
// DELETE COMMENT
// ============================================================================

/**
 * Delete a comment (will cascade delete all replies)
 *
 * @param id - Comment ID
 */
export async function deleteComment(id: string) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to delete comments");
  }

  // 2. Check ownership
  const existingComment = await db.query.comment.findFirst({
    where: and(eq(comment.id, id), eq(comment.userId, session.user.id)),
  });

  if (!existingComment) {
    throw new Error("Comment not found or you don't have permission to delete it");
  }

  // 3. Delete comment (cascade to replies)
  await db.delete(comment).where(eq(comment.id, id));

  // 4. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${existingComment.entityType}s/${existingComment.entityId}`);

  return { success: true };
}
