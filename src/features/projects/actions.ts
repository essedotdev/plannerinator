"use server";

import { db } from "@/db";
import { project } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createProjectSchema, updateProjectSchema } from "./schema";
import {
  validateSession,
  checkOwnership,
  revalidateEntityPaths,
  handleEntityError,
  copyEntityTags,
  softDeleteEntity,
  hardDeleteEntity,
  restoreEntityFromTrash,
  archiveEntity,
  restoreArchivedEntity,
} from "@/lib/entity-helpers";

/**
 * Project Server Actions
 *
 * All actions include:
 * - Authentication check
 * - Input validation (Zod)
 * - Authorization (user owns the project)
 * - Revalidation (cache invalidation)
 */

// ============================================================================
// CREATE PROJECT
// ============================================================================

/**
 * Create a new project
 *
 * @param input - Project data (validated against createProjectSchema)
 * @returns Created project object
 */
export async function createProject(input: unknown) {
  const session = await validateSession("create a project");

  // Validate input
  const data = createProjectSchema.parse(input);

  try {
    // Create project
    const [newProject] = await db
      .insert(project)
      .values({
        name: data.name,
        description: data.description,
        startDate: data.startDate ? data.startDate.toISOString() : null,
        endDate: data.endDate ? data.endDate.toISOString() : null,
        icon: data.icon,
        parentProjectId: data.parentProjectId,
        metadata: data.metadata,
        userId: session.user.id,
        // color and status use database defaults
      })
      .returning();

    // Revalidate paths
    revalidateEntityPaths("project");

    return { success: true, project: newProject };
  } catch (error) {
    handleEntityError(error, "creating", "project");
  }
}

// ============================================================================
// UPDATE PROJECT
// ============================================================================

/**
 * Update an existing project
 *
 * @param id - Project ID
 * @param input - Partial project data (validated against updateProjectSchema)
 * @returns Updated project object
 */
export async function updateProject(id: string, input: unknown) {
  const session = await validateSession("update a project");

  // Validate input
  const data = updateProjectSchema.parse(input);

  try {
    // Verify ownership
    await checkOwnership("project", id, session.user.id);

    // Build update data
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: new Date(),
    };

    // Convert dates to ISO strings if present
    if (data.startDate) {
      updateData.startDate = data.startDate.toISOString();
    }
    if (data.endDate) {
      updateData.endDate = data.endDate.toISOString();
    }

    const [updatedProject] = await db
      .update(project)
      .set(updateData)
      .where(eq(project.id, id))
      .returning();

    // Revalidate paths
    revalidateEntityPaths("project", id);

    return { success: true, project: updatedProject };
  } catch (error) {
    handleEntityError(error, "updating", "project");
  }
}

// ============================================================================
// DELETE PROJECT
// ============================================================================

/**
 * Soft delete a project (move to trash)
 *
 * Sets deleted_at timestamp. Project can be restored within 30 days.
 *
 * @param id - Project ID
 */
export async function deleteProject(id: string) {
  const session = await validateSession("delete a project");

  try {
    return await softDeleteEntity("project", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "deleting", "project");
  }
}

/**
 * Permanently delete a project (hard delete from trash)
 *
 * This action cannot be undone.
 * Note: This will cascade delete related tasks, events, and notes
 * due to database foreign key constraints (ON DELETE CASCADE)
 *
 * @param id - Project ID
 */
export async function hardDeleteProject(id: string) {
  const session = await validateSession("permanently delete a project");

  try {
    return await hardDeleteEntity("project", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "permanently deleting", "project");
  }
}

/**
 * Restore a project from trash
 *
 * @param id - Project UUID
 * @returns Success response
 */
export async function restoreFromTrashProject(id: string) {
  const session = await validateSession("restore a project from trash");

  try {
    return await restoreEntityFromTrash("project", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "restoring", "project");
  }
}

/**
 * Duplicate a project
 *
 * Creates a copy of an existing project with:
 * - Name prefixed with "Copy of"
 * - Same description, color, icon, status
 * - Dates cleared
 * - Parent relationship cleared
 * - Tags copied
 * - Stats reset to zero
 * - Entities (tasks/events/notes) NOT copied (user duplicates manually if needed)
 *
 * @param id - Project UUID to duplicate
 * @returns Newly created project object
 * @throws Error if user is not authenticated, project not found, or not authorized
 */
export async function duplicateProject(id: string) {
  const session = await validateSession("duplicate a project");

  try {
    // Verify ownership
    const originalProject = await checkOwnership<typeof project.$inferSelect>(
      "project",
      id,
      session.user.id
    );

    // Create duplicated project
    const [duplicatedProject] = await db
      .insert(project)
      .values({
        userId: session.user.id,
        name: `Copy of ${originalProject.name}`,
        description: originalProject.description,
        status: originalProject.status,
        color: originalProject.color,
        icon: originalProject.icon,
        parentProjectId: null, // Don't copy parent relationship
        startDate: null, // Clear dates
        endDate: null,
        metadata: originalProject.metadata,
      })
      .returning();

    // Copy tags
    await copyEntityTags("project", id, "project", duplicatedProject.id, session.user.id);

    // Revalidate paths
    revalidateEntityPaths("project");

    return { success: true, project: duplicatedProject };
  } catch (error) {
    handleEntityError(error, "duplicating", "project");
  }
}

// ============================================================================
// ARCHIVE PROJECT
// ============================================================================

/**
 * Archive a project using archived_at timestamp
 *
 * @param id - Project ID
 */
export async function archiveProject(id: string) {
  const session = await validateSession("archive a project");

  try {
    return await archiveEntity("project", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "archiving", "project");
  }
}

/**
 * Restore an archived project
 *
 * @param id - Project ID
 */
export async function restoreProject(id: string) {
  const session = await validateSession("restore a project from archive");

  try {
    return await restoreArchivedEntity("project", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "restoring", "project");
  }
}

// ============================================================================
// COMPLETE PROJECT
// ============================================================================

/**
 * Mark project as completed
 *
 * @param id - Project ID
 */
export async function completeProject(id: string) {
  return updateProject(id, { status: "completed" });
}
