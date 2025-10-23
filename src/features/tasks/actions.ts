"use server";

import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { task } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { syncAssignedToLink } from "@/features/links/helpers";
import {
  createTaskSchema,
  updateTaskSchema,
  bulkTaskOperationSchema,
  type UpdateTaskInput,
} from "./schema";

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
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to create a task");
  }

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

    // Revalidate tasks page
    revalidatePath("/dashboard/tasks");
    if (data.projectId) {
      revalidatePath(`/dashboard/projects/${data.projectId}`);
    }

    return { success: true, task: createdTask };
  } catch (error) {
    console.error("Error creating task:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create task");
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
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to update a task");
  }

  // Validate input
  const data = updateTaskSchema.parse(input);

  try {
    // Verify task exists and user owns it
    const existingTask = await db
      .select()
      .from(task)
      .where(and(eq(task.id, id), eq(task.userId, session.user.id)))
      .limit(1);

    if (existingTask.length === 0) {
      throw new Error("Task not found or you don't have permission to update it");
    }

    // Auto-set completedAt when status changes to 'done'
    const updateData: UpdateTaskInput & { completedAt?: Date | null } = { ...data };
    if (data.status === "done" && existingTask[0].status !== "done") {
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

    // Revalidate relevant pages
    revalidatePath("/dashboard/tasks");
    revalidatePath(`/dashboard/tasks/${id}`);
    if (existingTask[0].projectId) {
      revalidatePath(`/dashboard/projects/${existingTask[0].projectId}`);
    }
    if (data.projectId && data.projectId !== existingTask[0].projectId) {
      revalidatePath(`/dashboard/projects/${data.projectId}`);
    }

    return { success: true, task: updatedTask };
  } catch (error) {
    console.error("Error updating task:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update task");
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

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a task
 *
 * @param id - Task UUID
 * @returns Success response
 * @throws Error if user is not authenticated, task not found, or not authorized
 */
export async function deleteTask(id: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to delete a task");
  }

  try {
    // Verify task exists and user owns it
    const existingTask = await db
      .select()
      .from(task)
      .where(and(eq(task.id, id), eq(task.userId, session.user.id)))
      .limit(1);

    if (existingTask.length === 0) {
      throw new Error("Task not found or you don't have permission to delete it");
    }

    await db.delete(task).where(eq(task.id, id));

    // Revalidate relevant pages
    revalidatePath("/dashboard/tasks");
    if (existingTask[0].projectId) {
      revalidatePath(`/dashboard/projects/${existingTask[0].projectId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete task");
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
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to perform bulk operations");
  }

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

    // Revalidate tasks page and affected project pages
    revalidatePath("/dashboard/tasks");
    const projectIds = new Set(existingTasks.map((t) => t.projectId).filter(Boolean));
    projectIds.forEach((projectId) => {
      if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
    });

    return { success: true, affectedCount };
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to perform bulk operation");
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
