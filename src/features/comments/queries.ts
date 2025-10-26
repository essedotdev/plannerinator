"use server";

import { db } from "@/db";
import { comment, user } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getEntityCommentsSchema, type GetEntityCommentsInput } from "./schema";

/**
 * Comment Database Queries
 *
 * All queries include:
 * - Authentication check
 * - User isolation (only return user's comments)
 * - Input validation (Zod)
 */

// ============================================================================
// GET ENTITY COMMENTS
// ============================================================================

/**
 * Get all comments for a specific entity (including replies)
 *
 * @param input - Entity type and entity ID
 * @returns Array of comments with user info, pagination info
 */
export async function getEntityComments(input: GetEntityCommentsInput) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view comments");
  }

  // 2. Validate input
  const { entityType, entityId, limit = 50, offset = 0 } = getEntityCommentsSchema.parse(input);

  // 3. Get ALL comments (including replies) for this entity
  // Only show comments from the current user for now (user isolation)
  // In a real app, you might want to show comments from collaborators too
  const comments = await db
    .select({
      comment: comment,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(comment)
    .innerJoin(user, eq(comment.userId, user.id))
    .where(
      and(
        eq(comment.entityType, entityType),
        eq(comment.entityId, entityId),
        eq(comment.userId, session.user.id) // User isolation
      )
    )
    .orderBy(desc(comment.createdAt))
    .limit(limit)
    .offset(offset);

  // 4. Get total count (including replies)
  const [{ total }] = await db
    .select({ total: count() })
    .from(comment)
    .where(
      and(
        eq(comment.entityType, entityType),
        eq(comment.entityId, entityId),
        eq(comment.userId, session.user.id)
      )
    );

  return {
    comments,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + comments.length < total,
    },
  };
}

// ============================================================================
// GET COMMENT BY ID
// ============================================================================

/**
 * Get a single comment by ID with user info
 *
 * @param id - Comment ID
 * @returns Comment object with user info
 */
export async function getCommentById(id: string) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view comments");
  }

  // 2. Get comment
  const [foundComment] = await db
    .select({
      comment: comment,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(comment)
    .innerJoin(user, eq(comment.userId, user.id))
    .where(and(eq(comment.id, id), eq(comment.userId, session.user.id)));

  if (!foundComment) {
    throw new Error("Comment not found");
  }

  return foundComment;
}

// ============================================================================
// GET COMMENT REPLIES
// ============================================================================

/**
 * Get all replies to a specific comment
 *
 * @param parentCommentId - Parent comment ID
 * @returns Array of reply comments with user info
 */
export async function getCommentReplies(parentCommentId: string) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view comment replies");
  }

  // 2. Get replies
  const replies = await db
    .select({
      comment: comment,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(comment)
    .innerJoin(user, eq(comment.userId, user.id))
    .where(
      and(
        eq(comment.parentCommentId, parentCommentId),
        eq(comment.userId, session.user.id) // User isolation
      )
    )
    .orderBy(comment.createdAt); // Chronological order for replies

  return replies;
}

// ============================================================================
// GET COMMENT COUNT FOR ENTITY
// ============================================================================

/**
 * Get total comment count for an entity (including replies)
 *
 * @param entityType - Entity type
 * @param entityId - Entity ID
 * @returns Total comment count
 */
export async function getCommentCount(entityType: string, entityId: string) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view comment count");
  }

  // 2. Get count
  const [{ total }] = await db
    .select({ total: count() })
    .from(comment)
    .where(
      and(
        eq(comment.entityType, entityType as "task" | "event" | "note" | "project"),
        eq(comment.entityId, entityId),
        eq(comment.userId, session.user.id)
      )
    );

  return total;
}
