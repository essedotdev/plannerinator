/**
 * Link Helpers
 *
 * Utility functions for managing assigned_to links automatically
 * when projectId is set on entities (tasks, events, notes)
 */

import { db } from "@/db";
import { link } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { EntityType } from "./schema";

/**
 * Sync assigned_to link when projectId is set
 *
 * This function:
 * 1. Deletes any existing assigned_to link
 * 2. Creates new assigned_to link if projectId is provided
 *
 * @param userId - User ID (for ownership)
 * @param entityType - Type of entity (task, event, note)
 * @param entityId - ID of the entity
 * @param projectId - Project ID to assign to (null to remove assignment)
 */
export async function syncAssignedToLink(
  userId: string,
  entityType: EntityType,
  entityId: string,
  projectId: string | null | undefined
) {
  // Delete existing assigned_to link for this entity
  await db
    .delete(link)
    .where(
      and(
        eq(link.userId, userId),
        eq(link.fromType, entityType),
        eq(link.fromId, entityId),
        eq(link.relationship, "assigned_to")
      )
    );

  // Create new link if projectId is provided
  if (projectId) {
    await db.insert(link).values({
      userId,
      fromType: entityType,
      fromId: entityId,
      toType: "project",
      toId: projectId,
      relationship: "assigned_to",
      metadata: {},
    });
  }
}

/**
 * Get assigned project via link
 *
 * Returns the project ID that this entity is assigned to
 * by looking for an assigned_to link
 *
 * @param entityType - Type of entity
 * @param entityId - ID of the entity
 * @returns Project ID or null if not assigned
 */
export async function getAssignedProject(
  entityType: EntityType,
  entityId: string
): Promise<string | null> {
  const [assignedLink] = await db
    .select({ toId: link.toId })
    .from(link)
    .where(
      and(
        eq(link.fromType, entityType),
        eq(link.fromId, entityId),
        eq(link.toType, "project"),
        eq(link.relationship, "assigned_to")
      )
    )
    .limit(1);

  return assignedLink?.toId || null;
}

/**
 * Batch sync assigned_to links
 *
 * Useful for migrations or bulk operations
 *
 * @param userId - User ID
 * @param entities - Array of entities to sync
 */
export async function batchSyncAssignedToLinks(
  userId: string,
  entities: Array<{
    entityType: EntityType;
    entityId: string;
    projectId: string | null | undefined;
  }>
) {
  for (const entity of entities) {
    await syncAssignedToLink(userId, entity.entityType, entity.entityId, entity.projectId);
  }
}
