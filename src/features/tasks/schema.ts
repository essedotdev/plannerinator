import { z } from "zod";
import { optionalJsonObject } from "@/lib/json-schema";

/**
 * Task validation schemas using Zod
 *
 * These schemas provide runtime validation for task operations
 * and are used to infer TypeScript types for forms and API endpoints.
 */

/**
 * Task status enum schema
 */
export const taskStatusSchema = z.enum(["todo", "in_progress", "done", "cancelled"], {
  message: "Status must be todo, in_progress, done, or cancelled",
});

/**
 * Task priority enum schema
 */
export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"], {
  message: "Priority must be low, medium, high, or urgent",
});

/**
 * Base task schema with all fields
 * Used as foundation for create/update schemas
 */
const baseTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .trim(),

  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .nullable(),

  // Scheduling
  dueDate: z.coerce.date().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  duration: z.number().int().min(1, "Duration must be at least 1 minute").optional().nullable(),

  // Status & Priority
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("medium").optional().nullable(),

  // Organization
  projectId: z.string().uuid("Invalid project ID").optional().nullable(),
  parentTaskId: z.string().uuid("Invalid parent task ID").optional().nullable(),

  // Ordering
  position: z.number().int().min(0).default(0).optional(),

  // Custom metadata (free-form JSON)
  metadata: optionalJsonObject(),
});

/**
 * Schema for creating a new task
 *
 * userId and timestamps are automatically added server-side
 */
export const createTaskSchema = baseTaskSchema.omit({
  status: true,
  position: true,
});

/**
 * Schema for updating an existing task
 *
 * All fields are optional (partial update)
 * completedAt is automatically set when status changes to 'done'
 */
export const updateTaskSchema = baseTaskSchema.partial();

/**
 * Tag filter logic enum schema
 */
export const tagFilterLogicSchema = z.enum(["AND", "OR"], {
  message: "Tag filter logic must be AND or OR",
});

/**
 * Schema for task filters/search
 */
export const taskFilterSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  projectId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional().nullable(),

  // Date filters
  dueDateFrom: z.coerce.date().optional(),
  dueDateTo: z.coerce.date().optional(),

  // Tag filters
  tagIds: z.array(z.string().uuid()).optional(),
  tagLogic: tagFilterLogicSchema.default("OR").optional(),

  // Search
  search: z.string().max(500).optional(),

  // Pagination
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),

  // Sorting
  sortBy: z
    .enum(["createdAt", "dueDate", "priority", "title", "position"])
    .default("createdAt")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

/**
 * Schema for bulk task operations
 */
export const bulkTaskOperationSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1, "At least one task ID is required"),
  operation: z.enum(["delete", "complete", "archive", "updateStatus", "updatePriority"]),
  // Optional data for specific operations
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
});

/**
 * Inferred TypeScript types from schemas
 */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
export type BulkTaskOperationInput = z.infer<typeof bulkTaskOperationSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
