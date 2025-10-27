"use server";

import { db } from "@/db";
import { task } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { syncAssignedToLink } from "@/features/links/helpers";
import {
  createTaskSchema,
  updateTaskSchema,
  bulkTaskOperationSchema,
  type UpdateTaskInput,
} from "./schema";
import {
  validateSession,
  checkOwnership,
  revalidateEntityPaths,
  revalidateProjectChange,
  handleEntityError,
  copyEntityTags,
  softDeleteEntity,
  hardDeleteEntity,
  restoreEntityFromTrash,
  archiveEntity,
  restoreArchivedEntity,
} from "@/lib/entity-helpers";

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new task
 *
 * @param input - Task data conforming to CreateTaskInput
 * @returns Created task object with id
 * @throws Error if user is not authenticated or validation fails
 */
export async function createTask(input: unknown) {
  const session = await validateSession("create a task");

  // Validate input
  const data = createTaskSchema.parse(input);

  try {
    // Create task
    const [createdTask] = await db
      .insert(task)
      .values({
        ...data,
        userId: session.user.id,
        status: "todo",
        position: 0,
      })
      .returning();

    // Sync assigned_to link if projectId is provided
    if (data.projectId) {
      await syncAssignedToLink(session.user.id, "task", createdTask.id, data.projectId);
    }

    // Revalidate paths
    revalidateEntityPaths("task", undefined, data.projectId);

    return { success: true, task: createdTask };
  } catch (error) {
    handleEntityError(error, "creating", "task");
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update an existing task
 *
 * @param id - Task UUID
 * @param input - Partial task data to update
 * @returns Updated task object
 * @throws Error if user is not authenticated, task not found, or not authorized
 */
export async function updateTask(id: string, input: unknown) {
  const session = await validateSession("update a task");

  // Validate input
  const data = updateTaskSchema.parse(input);

  try {
    // Verify ownership
    const existingTask = await checkOwnership<typeof task.$inferSelect>(
      "task",
      id,
      session.user.id
    );

    // Auto-set completedAt when status changes to 'done'
    const updateData: UpdateTaskInput & { completedAt?: Date | null } = { ...data };
    if (data.status === "done" && existingTask.status !== "done") {
      updateData.completedAt = new Date();
    } else if (data.status && data.status !== "done") {
      updateData.completedAt = null;
    }

    // Update task
    const [updatedTask] = await db.update(task).set(updateData).where(eq(task.id, id)).returning();

    // Sync assigned_to link if projectId changed
    if ("projectId" in data) {
      await syncAssignedToLink(session.user.id, "task", id, data.projectId);
    }

    // Revalidate paths
    revalidateEntityPaths("task", id, existingTask.projectId);
    revalidateProjectChange("task", existingTask.projectId, data.projectId);

    return { success: true, task: updatedTask };
  } catch (error) {
    handleEntityError(error, "updating", "task");
  }
}

/**
 * Mark a task as complete
 *
 * @param id - Task UUID
 * @returns Updated task object
 */
export async function markTaskComplete(id: string) {
  return updateTask(id, { status: "done" });
}

/**
 * Mark a task as incomplete (reopen)
 *
 * @param id - Task UUID
 * @returns Updated task object
 */
export async function markTaskIncomplete(id: string) {
  return updateTask(id, { status: "todo" });
}

/**
 * Update task status (for Kanban drag & drop)
 *
 * @param id - Task UUID
 * @param status - New status (todo, in_progress, done)
 * @returns Updated task object
 */
export async function updateTaskStatus(
  id: string,
  status: "todo" | "in_progress" | "done" | "cancelled"
) {
  return updateTask(id, { status });
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Soft delete a task (move to trash)
 *
 * Sets deleted_at timestamp. Task can be restored within 30 days.
 *
 * @param id - Task UUID
 * @returns Success response
 * @throws Error if user is not authenticated, task not found, or not authorized
 */
export async function deleteTask(id: string) {
  const session = await validateSession("delete a task");

  try {
    return await softDeleteEntity("task", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "deleting", "task");
  }
}

/**
 * Permanently delete a task (hard delete from trash)
 *
 * This action cannot be undone.
 *
 * @param id - Task UUID
 * @returns Success response
 */
export async function hardDeleteTask(id: string) {
  const session = await validateSession("permanently delete a task");

  try {
    return await hardDeleteEntity("task", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "permanently deleting", "task");
  }
}

/**
 * Restore a task from trash
 *
 * @param id - Task UUID
 * @returns Success response
 */
export async function restoreFromTrashTask(id: string) {
  const session = await validateSession("restore a task from trash");

  try {
    return await restoreEntityFromTrash("task", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "restoring", "task");
  }
}

/**
 * Duplicate a task
 *
 * Creates a copy of an existing task with:
 * - Title prefixed with "Copy of"
 * - Same description, priority, project assignment
 * - Status reset to "todo"
 * - Dates and completion cleared
 * - Tags copied
 * - Comments, links, attachments, and subtasks NOT copied
 *
 * @param id - Task UUID to duplicate
 * @returns Newly created task object
 * @throws Error if user is not authenticated, task not found, or not authorized
 */
export async function duplicateTask(id: string) {
  const session = await validateSession("duplicate a task");

  try {
    // Verify ownership
    const originalTask = await checkOwnership<typeof task.$inferSelect>(
      "task",
      id,
      session.user.id
    );

    // Create duplicated task
    const [duplicatedTask] = await db
      .insert(task)
      .values({
        userId: session.user.id,
        title: `Copy of ${originalTask.title}`,
        description: originalTask.description,
        priority: originalTask.priority,
        projectId: originalTask.projectId,
        status: "todo",
        dueDate: null,
        startDate: null,
        duration: originalTask.duration,
        completedAt: null,
        parentTaskId: null, // Don't copy parent relationship
        position: 0,
        metadata: originalTask.metadata,
      })
      .returning();

    // Copy tags
    await copyEntityTags("task", id, "task", duplicatedTask.id, session.user.id);

    // Sync assigned_to link if projectId exists
    if (duplicatedTask.projectId) {
      await syncAssignedToLink(
        session.user.id,
        "task",
        duplicatedTask.id,
        duplicatedTask.projectId
      );
    }

    // Revalidate paths
    revalidateEntityPaths("task", undefined, duplicatedTask.projectId);

    return { success: true, task: duplicatedTask };
  } catch (error) {
    handleEntityError(error, "duplicating", "task");
  }
}

// ============================================================================
// ARCHIVE OPERATIONS
// ============================================================================

/**
 * Archive a task
 *
 * Sets archived_at timestamp to hide task from default views.
 * Task remains in database and can be restored.
 *
 * @param id - Task UUID to archive
 * @returns Success response
 * @throws Error if user is not authenticated, task not found, or not authorized
 */
export async function archiveTask(id: string) {
  const session = await validateSession("archive a task");

  try {
    return await archiveEntity("task", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "archiving", "task");
  }
}

/**
 * Restore an archived task
 *
 * Clears archived_at timestamp to show task in default views.
 *
 * @param id - Task UUID to restore
 * @returns Success response
 * @throws Error if user is not authenticated, task not found, or not authorized
 */
export async function restoreTask(id: string) {
  const session = await validateSession("restore a task from archive");

  try {
    return await restoreArchivedEntity("task", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "restoring", "task");
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Perform bulk operations on multiple tasks
 *
 * Supported operations:
 * - delete: Delete multiple tasks
 * - complete: Mark multiple tasks as done
 * - updateStatus: Update status for multiple tasks
 * - updatePriority: Update priority for multiple tasks
 *
 * @param input - Bulk operation input with taskIds and operation type
 * @returns Success response with count of affected tasks
 * @throws Error if user is not authenticated or validation fails
 */
export async function bulkTaskOperation(input: unknown) {
  const session = await validateSession("perform bulk operations");

  // Validate input
  const data = bulkTaskOperationSchema.parse(input);

  try {
    // Verify all tasks exist and user owns them
    const existingTasks = await db
      .select()
      .from(task)
      .where(and(inArray(task.id, data.taskIds), eq(task.userId, session.user.id)));

    if (existingTasks.length !== data.taskIds.length) {
      throw new Error("Some tasks not found or you don't have permission to modify them");
    }

    let affectedCount = 0;

    switch (data.operation) {
      case "delete":
        await db.delete(task).where(inArray(task.id, data.taskIds));
        affectedCount = data.taskIds.length;
        break;

      case "complete":
        await db
          .update(task)
          .set({ status: "done", completedAt: new Date() })
          .where(inArray(task.id, data.taskIds));
        affectedCount = data.taskIds.length;
        break;

      case "updateStatus":
        if (!data.status) {
          throw new Error("Status is required for updateStatus operation");
        }
        await db
          .update(task)
          .set({
            status: data.status,
            completedAt: data.status === "done" ? new Date() : null,
          })
          .where(inArray(task.id, data.taskIds));
        affectedCount = data.taskIds.length;
        break;

      case "updatePriority":
        if (!data.priority) {
          throw new Error("Priority is required for updatePriority operation");
        }
        await db
          .update(task)
          .set({ priority: data.priority })
          .where(inArray(task.id, data.taskIds));
        affectedCount = data.taskIds.length;
        break;

      default:
        throw new Error(`Unsupported bulk operation: ${data.operation}`);
    }

    // Revalidate paths
    revalidateEntityPaths("task");
    const projectIds = new Set(existingTasks.map((t) => t.projectId).filter(Boolean));
    projectIds.forEach((projectId) => {
      if (projectId) revalidateEntityPaths("project", projectId);
    });

    return { success: true, affectedCount };
  } catch (error) {
    handleEntityError(error, "performing bulk operation on", "task");
  }
}

/**
 * Delete multiple tasks
 *
 * @param taskIds - Array of task UUIDs
 * @returns Success response with count
 */
export async function bulkDeleteTasks(taskIds: string[]) {
  return bulkTaskOperation({ taskIds, operation: "delete" });
}

/**
 * Mark multiple tasks as complete
 *
 * @param taskIds - Array of task UUIDs
 * @returns Success response with count
 */
export async function bulkCompleteTasks(taskIds: string[]) {
  return bulkTaskOperation({ taskIds, operation: "complete" });
}
