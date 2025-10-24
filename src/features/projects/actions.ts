"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { project } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { createProjectSchema, updateProjectSchema } from "./schema";

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
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to create projects");
  }

  // 2. Validate input
  const data = createProjectSchema.parse(input);

  // 3. Create project
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

  // 4. Revalidate cache
  revalidatePath("/dashboard/projects");

  return { success: true, project: newProject };
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
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to update projects");
  }

  // 2. Validate input
  const data = updateProjectSchema.parse(input);

  // 3. Check ownership
  const existingProject = await db.query.project.findFirst({
    where: and(eq(project.id, id), eq(project.userId, session.user.id)),
  });

  if (!existingProject) {
    throw new Error("Project not found or you don't have permission to update it");
  }

  // 4. Update project
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

  // 5. Revalidate cache
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${id}`);

  return { success: true, project: updatedProject };
}

// ============================================================================
// DELETE PROJECT
// ============================================================================

/**
 * Delete a project
 *
 * Note: This will cascade delete related tasks, events, and notes
 * due to database foreign key constraints (ON DELETE CASCADE)
 *
 * @param id - Project ID
 */
export async function deleteProject(id: string) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to delete projects");
  }

  // 2. Check ownership
  const existingProject = await db.query.project.findFirst({
    where: and(eq(project.id, id), eq(project.userId, session.user.id)),
  });

  if (!existingProject) {
    throw new Error("Project not found or you don't have permission to delete it");
  }

  // 3. Delete project (cascade to tasks, events, notes)
  await db.delete(project).where(eq(project.id, id));

  // 4. Revalidate cache
  revalidatePath("/dashboard/projects");

  return { success: true };
}

// ============================================================================
// ARCHIVE PROJECT
// ============================================================================

/**
 * Archive a project (shortcut to set status to 'archived')
 *
 * @param id - Project ID
 */
export async function archiveProject(id: string) {
  return updateProject(id, { status: "archived" });
}

/**
 * Unarchive a project (set status back to 'active')
 *
 * @param id - Project ID
 */
export async function unarchiveProject(id: string) {
  return updateProject(id, { status: "active" });
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
