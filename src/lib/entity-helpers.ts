/**
 * Entity Helpers
 *
 * Shared utility functions for entity CRUD operations.
 * These helpers reduce code duplication across task, event, note, and project actions.
 */

import { getSession } from "@/lib/auth";
import { db } from "@/db";
import {
  task,
  event,
  note,
  project,
  entityTag,
  comment,
  link,
  attachment,
  user,
} from "@/db/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { AppSession } from "@/types/auth";
import { r2 } from "@/lib/r2-client";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type EntityType = "task" | "event" | "note" | "project";

interface EntityWithProject {
  id: string;
  projectId?: string | null;
  userId: string;
}

// ============================================================================
// SESSION VALIDATION
// ============================================================================

/**
 * Validate user session
 *
 * @param operation - Operation being performed (for error message)
 * @returns User session
 * @throws Error if user is not authenticated
 */
export async function validateSession(operation: string): Promise<AppSession> {
  const session = await getSession();

  if (!session?.user) {
    throw new Error(`Unauthorized: You must be logged in to ${operation}`);
  }

  return session;
}

// ============================================================================
// OWNERSHIP VERIFICATION
// ============================================================================

/**
 * Check if user owns the specified entity
 *
 * @param entityType - Type of entity (task, event, note, project)
 * @param entityId - Entity UUID
 * @param userId - User UUID
 * @returns Entity if found and owned by user
 * @throws Error if entity not found or user doesn't own it
 */
export async function checkOwnership<T extends EntityWithProject>(
  entityType: EntityType,
  entityId: string,
  userId: string
): Promise<T> {
  let existingEntity;

  // TypeScript needs explicit handling for each entity type
  switch (entityType) {
    case "task":
      existingEntity = await db.query.task.findFirst({
        where: and(eq(task.id, entityId), eq(task.userId, userId)),
      });
      break;
    case "event":
      existingEntity = await db.query.event.findFirst({
        where: and(eq(event.id, entityId), eq(event.userId, userId)),
      });
      break;
    case "note":
      existingEntity = await db.query.note.findFirst({
        where: and(eq(note.id, entityId), eq(note.userId, userId)),
      });
      break;
    case "project":
      existingEntity = await db.query.project.findFirst({
        where: and(eq(project.id, entityId), eq(project.userId, userId)),
      });
      break;
  }

  if (!existingEntity) {
    throw new Error(
      `${capitalize(entityType)} not found or you don't have permission to access it`
    );
  }

  return existingEntity as unknown as T;
}

/**
 * Check if user owns multiple entities
 *
 * @param entityType - Type of entity
 * @param entityIds - Array of entity UUIDs
 * @param userId - User UUID
 * @returns Array of entities
 * @throws Error if any entity not found or not owned
 */
export async function checkBulkOwnership<T extends EntityWithProject>(
  entityType: EntityType,
  entityIds: string[],
  userId: string
): Promise<T[]> {
  // Note: This function is not currently used in the refactored actions
  // but kept for potential future use
  throw new Error(
    `checkBulkOwnership not implemented for ${entityType} (${entityIds.length} items, user: ${userId.slice(0, 8)}...) - use entity-specific bulk checks`
  );
}

// ============================================================================
// CACHE REVALIDATION
// ============================================================================

/**
 * Revalidate relevant paths after entity mutation
 *
 * @param entityType - Type of entity
 * @param entityId - Entity UUID (optional, for detail pages)
 * @param projectId - Related project UUID (optional)
 * @param includeTrash - Whether to revalidate trash page
 */
export function revalidateEntityPaths(
  entityType: EntityType,
  entityId?: string,
  projectId?: string | null,
  includeTrash = false
): void {
  // Revalidate list page
  revalidatePath(`/dashboard/${entityType}s`);

  // Revalidate detail page if ID provided
  if (entityId) {
    revalidatePath(`/dashboard/${entityType}s/${entityId}`);
  }

  // Revalidate related project page
  if (projectId) {
    revalidatePath(`/dashboard/projects/${projectId}`);
  }

  // Revalidate trash page if needed
  if (includeTrash) {
    revalidatePath("/dashboard/trash");
  }
}

/**
 * Revalidate paths when project assignment changes
 *
 * @param entityType - Type of entity
 * @param oldProjectId - Previous project ID
 * @param newProjectId - New project ID
 */
export function revalidateProjectChange(
  entityType: EntityType,
  oldProjectId?: string | null,
  newProjectId?: string | null
): void {
  if (oldProjectId) {
    revalidatePath(`/dashboard/projects/${oldProjectId}`);
  }
  if (newProjectId && newProjectId !== oldProjectId) {
    revalidatePath(`/dashboard/projects/${newProjectId}`);
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handle and format errors from entity operations
 *
 * @param error - Error object
 * @param operation - Operation being performed
 * @param entityType - Type of entity
 * @throws Formatted error
 */
export function handleEntityError(
  error: unknown,
  operation: string,
  entityType: EntityType
): never {
  console.error(`Error ${operation} ${entityType}:`, error);

  if (error instanceof Error) {
    throw error;
  }

  throw new Error(`Failed to ${operation} ${entityType}`);
}

// ============================================================================
// TAG OPERATIONS
// ============================================================================

/**
 * Copy tags from one entity to another
 *
 * Useful for duplication operations.
 *
 * @param sourceEntityType - Source entity type
 * @param sourceEntityId - Source entity UUID
 * @param targetEntityType - Target entity type
 * @param targetEntityId - Target entity UUID
 * @param userId - User UUID
 */
export async function copyEntityTags(
  sourceEntityType: EntityType,
  sourceEntityId: string,
  targetEntityType: EntityType,
  targetEntityId: string,
  userId: string
): Promise<void> {
  // Get source entity tags
  const sourceTags = await db
    .select()
    .from(entityTag)
    .where(and(eq(entityTag.entityType, sourceEntityType), eq(entityTag.entityId, sourceEntityId)));

  // Copy tags to target entity
  if (sourceTags.length > 0) {
    await db.insert(entityTag).values(
      sourceTags.map((tag) => ({
        userId,
        entityType: targetEntityType,
        entityId: targetEntityId,
        tagId: tag.tagId,
      }))
    );
  }
}

// ============================================================================
// SOFT DELETE OPERATIONS
// ============================================================================

/**
 * Soft delete an entity (set deletedAt timestamp)
 *
 * @param entityType - Type of entity
 * @param entityId - Entity UUID
 * @param userId - User UUID
 * @param includeTrash - Whether to revalidate trash page
 * @returns Success response
 */
export async function softDeleteEntity(
  entityType: EntityType,
  entityId: string,
  userId: string,
  includeTrash = true
): Promise<{ success: true }> {
  // Check ownership
  const entity = await checkOwnership(entityType, entityId, userId);

  // Soft delete based on entity type
  switch (entityType) {
    case "task":
      await db.update(task).set({ deletedAt: new Date() }).where(eq(task.id, entityId));
      break;
    case "event":
      await db.update(event).set({ deletedAt: new Date() }).where(eq(event.id, entityId));
      break;
    case "note":
      await db.update(note).set({ deletedAt: new Date() }).where(eq(note.id, entityId));
      break;
    case "project":
      await db.update(project).set({ deletedAt: new Date() }).where(eq(project.id, entityId));
      break;
  }

  // Revalidate paths
  revalidateEntityPaths(entityType, entityId, entity.projectId, includeTrash);

  return { success: true };
}

/**
 * Hard delete an entity (permanent removal)
 *
 * Performs complete cleanup of all related data:
 * - Attachments (both R2 files and database records)
 * - Comments
 * - Tags
 * - Links (bidirectional)
 * - Main entity
 *
 * Uses database transaction to ensure atomicity.
 *
 * @param entityType - Type of entity
 * @param entityId - Entity UUID
 * @param userId - User UUID
 * @returns Success response
 */
export async function hardDeleteEntity(
  entityType: EntityType,
  entityId: string,
  userId: string
): Promise<{ success: true }> {
  // Check ownership
  await checkOwnership(entityType, entityId, userId);

  // Execute cleanup in transaction for atomicity
  await db.transaction(async (tx) => {
    // ========================================================================
    // 1. DELETE ATTACHMENTS (R2 files + database records + storage quota)
    // ========================================================================
    const attachments = await tx
      .select()
      .from(attachment)
      .where(and(eq(attachment.entityType, entityType), eq(attachment.entityId, entityId)));

    // Delete files from R2
    if (attachments.length > 0) {
      const r2DeletePromises = attachments.map((att) =>
        r2.deleteObject({ Key: att.storageKey }).catch((error) => {
          console.error(`Error deleting ${att.storageKey} from R2:`, error);
          // Continue even if R2 deletion fails (file might already be deleted)
        })
      );
      await Promise.all(r2DeletePromises);

      // Delete attachment records from database
      await tx
        .delete(attachment)
        .where(and(eq(attachment.entityType, entityType), eq(attachment.entityId, entityId)));

      // Update user storage quota
      const totalSize = attachments.reduce((sum, att) => sum + att.fileSize, 0);
      await tx
        .update(user)
        .set({
          storageUsedBytes: sql`GREATEST(0, ${user.storageUsedBytes} - ${totalSize})`,
        })
        .where(eq(user.id, userId));
    }

    // ========================================================================
    // 2. DELETE COMMENTS
    // ========================================================================
    await tx
      .delete(comment)
      .where(and(eq(comment.entityType, entityType), eq(comment.entityId, entityId)));

    // ========================================================================
    // 3. DELETE ENTITY TAGS
    // ========================================================================
    await tx
      .delete(entityTag)
      .where(and(eq(entityTag.entityType, entityType), eq(entityTag.entityId, entityId)));

    // ========================================================================
    // 4. DELETE LINKS (bidirectional - both from and to)
    // ========================================================================
    await tx
      .delete(link)
      .where(
        or(
          and(eq(link.fromType, entityType), eq(link.fromId, entityId)),
          and(eq(link.toType, entityType), eq(link.toId, entityId))
        )
      );

    // ========================================================================
    // 5. DELETE MAIN ENTITY
    // ========================================================================
    switch (entityType) {
      case "task":
        await tx.delete(task).where(eq(task.id, entityId));
        break;
      case "event":
        await tx.delete(event).where(eq(event.id, entityId));
        break;
      case "note":
        await tx.delete(note).where(eq(note.id, entityId));
        break;
      case "project":
        await tx.delete(project).where(eq(project.id, entityId));
        break;
    }
  });

  // Revalidate paths
  revalidateEntityPaths(entityType, undefined, undefined, true);

  return { success: true };
}

/**
 * Restore entity from trash (clear deletedAt)
 *
 * @param entityType - Type of entity
 * @param entityId - Entity UUID
 * @param userId - User UUID
 * @returns Success response
 */
export async function restoreEntityFromTrash(
  entityType: EntityType,
  entityId: string,
  userId: string
): Promise<{ success: true }> {
  // Check ownership
  const entity = await checkOwnership(entityType, entityId, userId);

  // Restore from trash based on entity type
  switch (entityType) {
    case "task":
      await db.update(task).set({ deletedAt: null }).where(eq(task.id, entityId));
      break;
    case "event":
      await db.update(event).set({ deletedAt: null }).where(eq(event.id, entityId));
      break;
    case "note":
      await db.update(note).set({ deletedAt: null }).where(eq(note.id, entityId));
      break;
    case "project":
      await db.update(project).set({ deletedAt: null }).where(eq(project.id, entityId));
      break;
  }

  // Revalidate paths
  revalidateEntityPaths(entityType, entityId, entity.projectId, true);

  return { success: true };
}

// ============================================================================
// ARCHIVE OPERATIONS
// ============================================================================

/**
 * Archive an entity (set archivedAt timestamp)
 *
 * @param entityType - Type of entity
 * @param entityId - Entity UUID
 * @param userId - User UUID
 * @returns Success response
 */
export async function archiveEntity(
  entityType: EntityType,
  entityId: string,
  userId: string
): Promise<{ success: true }> {
  // Check ownership
  const entity = await checkOwnership(entityType, entityId, userId);

  // Archive based on entity type
  switch (entityType) {
    case "task":
      await db.update(task).set({ archivedAt: new Date() }).where(eq(task.id, entityId));
      break;
    case "event":
      await db.update(event).set({ archivedAt: new Date() }).where(eq(event.id, entityId));
      break;
    case "note":
      await db.update(note).set({ archivedAt: new Date() }).where(eq(note.id, entityId));
      break;
    case "project":
      await db.update(project).set({ archivedAt: new Date() }).where(eq(project.id, entityId));
      break;
  }

  // Revalidate paths
  revalidateEntityPaths(entityType, entityId, entity.projectId);

  return { success: true };
}

/**
 * Restore archived entity (clear archivedAt)
 *
 * @param entityType - Type of entity
 * @param entityId - Entity UUID
 * @param userId - User UUID
 * @returns Success response
 */
export async function restoreArchivedEntity(
  entityType: EntityType,
  entityId: string,
  userId: string
): Promise<{ success: true }> {
  // Check ownership
  const entity = await checkOwnership(entityType, entityId, userId);

  // Restore from archive based on entity type
  switch (entityType) {
    case "task":
      await db.update(task).set({ archivedAt: null }).where(eq(task.id, entityId));
      break;
    case "event":
      await db.update(event).set({ archivedAt: null }).where(eq(event.id, entityId));
      break;
    case "note":
      await db.update(note).set({ archivedAt: null }).where(eq(note.id, entityId));
      break;
    case "project":
      await db.update(project).set({ archivedAt: null }).where(eq(project.id, entityId));
      break;
  }

  // Revalidate paths
  revalidateEntityPaths(entityType, entityId, entity.projectId);

  return { success: true };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Capitalize first letter of string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
