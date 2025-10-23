import { db } from "@/db";
import { task, project, link, entityTag } from "@/db/schema";
import { eq, and, gte, lte, desc, asc, or, ilike, isNull, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { taskFilterSchema, type TaskFilterInput } from "./schema";

// ============================================================================
// SINGLE TASK QUERIES
// ============================================================================

/**
 * Get a single task by ID with all relations
 *
 * Relations included:
 * - Project (if assigned)
 * - Subtasks (child tasks)
 * - Parent task (if this is a subtask)
 *
 * Future relations (not yet implemented):
 * - Tags
 * - Comments
 * - Links to other entities
 *
 * @param id - Task UUID
 * @returns Task with relations or null if not found
 * @throws Error if user is not authenticated
 */
export async function getTaskById(id: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view tasks");
  }

  try {
    // Get task with project relation via link table
    const [taskData] = await db
      .select({
        task: task,
        project: project,
      })
      .from(task)
      .leftJoin(
        link,
        and(
          eq(link.fromType, "task"),
          eq(link.fromId, task.id),
          eq(link.relationship, "assigned_to"),
          eq(link.toType, "project")
        )
      )
      .leftJoin(project, eq(link.toId, project.id))
      .where(and(eq(task.id, id), eq(task.userId, session.user.id)))
      .limit(1);

    if (!taskData) {
      return null;
    }

    // Get subtasks
    const subtasks = await db
      .select()
      .from(task)
      .where(and(eq(task.parentTaskId, id), eq(task.userId, session.user.id)))
      .orderBy(asc(task.position));

    // Get parent task if exists
    let parentTask = null;
    if (taskData.task.parentTaskId) {
      const [parent] = await db
        .select()
        .from(task)
        .where(eq(task.id, taskData.task.parentTaskId))
        .limit(1);
      parentTask = parent || null;
    }

    return {
      ...taskData.task,
      project: taskData.project || null,
      subtasks,
      parentTask,
    };
  } catch (error) {
    console.error("Error fetching task:", error);
    throw new Error("Failed to fetch task");
  }
}

// ============================================================================
// TASK LIST QUERIES
// ============================================================================

/**
 * Get tasks with optional filters, sorting, and pagination
 *
 * Filters:
 * - status: Filter by task status
 * - priority: Filter by priority level
 * - projectId: Filter by project
 * - parentTaskId: Get subtasks of a specific task (or null for root tasks)
 * - dueDateFrom/dueDateTo: Filter by due date range
 * - search: Full-text search in title and description
 *
 * Sorting:
 * - sortBy: createdAt, dueDate, priority, title, position
 * - sortOrder: asc or desc
 *
 * Pagination:
 * - limit: Number of results (default 50, max 100)
 * - offset: Skip N results
 *
 * @param input - Filter, sort, and pagination options
 * @returns Array of tasks with count
 * @throws Error if user is not authenticated or validation fails
 */
export async function getTasks(input: unknown = {}) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view tasks");
  }

  // Validate and set defaults
  const filters = taskFilterSchema.parse(input);

  try {
    // Build where conditions
    const conditions = [eq(task.userId, session.user.id)];

    if (filters.status) {
      conditions.push(eq(task.status, filters.status));
    }

    if (filters.priority) {
      conditions.push(eq(task.priority, filters.priority));
    }

    if (filters.projectId) {
      conditions.push(eq(link.toId, filters.projectId));
    }

    // Handle parentTaskId filter (null = root tasks, uuid = specific parent)
    if (filters.parentTaskId !== undefined) {
      if (filters.parentTaskId === null) {
        conditions.push(isNull(task.parentTaskId));
      } else {
        conditions.push(eq(task.parentTaskId, filters.parentTaskId));
      }
    }

    if (filters.dueDateFrom) {
      conditions.push(gte(task.dueDate, filters.dueDateFrom));
    }

    if (filters.dueDateTo) {
      conditions.push(lte(task.dueDate, filters.dueDateTo));
    }

    // Search in title and description
    if (filters.search) {
      conditions.push(
        or(
          ilike(task.title, `%${filters.search}%`),
          ilike(task.description, `%${filters.search}%`)
        )!
      );
    }

    // Tag filtering
    // If tagIds are provided, filter tasks that have the specified tags
    // - OR logic: task has at least one of the tags
    // - AND logic: task has all of the tags
    if (filters.tagIds && filters.tagIds.length > 0) {
      const tagLogic = filters.tagLogic || "OR";

      if (tagLogic === "OR") {
        // OR logic: task has at least one of the tags
        // Use EXISTS subquery to check if task has any of the specified tags
        conditions.push(
          sql`EXISTS (
            SELECT 1 FROM ${entityTag}
            WHERE ${entityTag.entityType} = 'task'
            AND ${entityTag.entityId} = ${task.id}
            AND ${entityTag.tagId} = ANY(${sql`ARRAY[${sql.join(
              filters.tagIds.map((id) => sql`${id}::uuid`),
              sql`, `
            )}]`})
          )`
        );
      } else {
        // AND logic: task has all of the tags
        // Use subquery with HAVING COUNT to ensure task has all tags
        conditions.push(
          sql`EXISTS (
            SELECT 1 FROM ${entityTag}
            WHERE ${entityTag.entityType} = 'task'
            AND ${entityTag.entityId} = ${task.id}
            AND ${entityTag.tagId} = ANY(${sql`ARRAY[${sql.join(
              filters.tagIds.map((id) => sql`${id}::uuid`),
              sql`, `
            )}]`})
            GROUP BY ${entityTag.entityId}
            HAVING COUNT(DISTINCT ${entityTag.tagId}) = ${filters.tagIds.length}
          )`
        );
      }
    }

    // Build order by clause
    let orderByClause;
    switch (filters.sortBy) {
      case "dueDate":
        orderByClause = filters.sortOrder === "asc" ? asc(task.dueDate) : desc(task.dueDate);
        break;
      case "priority":
        orderByClause = filters.sortOrder === "asc" ? asc(task.priority) : desc(task.priority);
        break;
      case "title":
        orderByClause = filters.sortOrder === "asc" ? asc(task.title) : desc(task.title);
        break;
      case "position":
        orderByClause = filters.sortOrder === "asc" ? asc(task.position) : desc(task.position);
        break;
      case "createdAt":
      default:
        orderByClause = filters.sortOrder === "asc" ? asc(task.createdAt) : desc(task.createdAt);
        break;
    }

    // Execute query with pagination
    const tasks = await db
      .select({
        task: task,
        project: project,
      })
      .from(task)
      .leftJoin(
        link,
        and(
          eq(link.fromType, "task"),
          eq(link.fromId, task.id),
          eq(link.relationship, "assigned_to"),
          eq(link.toType, "project")
        )
      )
      .leftJoin(project, eq(link.toId, project.id))
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(filters.limit ?? 50)
      .offset(filters.offset ?? 0);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(task)
      .where(and(...conditions));

    const total = countResult?.count ?? 0;

    return {
      tasks: tasks.map((row) => ({
        ...row.task,
        project: row.project || null,
      })),
      pagination: {
        total,
        limit: filters.limit ?? 50,
        offset: filters.offset ?? 0,
        hasMore: (filters.offset ?? 0) + (filters.limit ?? 50) < total,
      },
    };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
}

// ============================================================================
// SPECIALIZED QUERIES
// ============================================================================

/**
 * Get all subtasks of a parent task
 *
 * @param parentTaskId - Parent task UUID
 * @returns Array of subtasks ordered by position
 * @throws Error if user is not authenticated
 */
export async function getSubtasks(parentTaskId: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view tasks");
  }

  try {
    const subtasks = await db
      .select()
      .from(task)
      .where(and(eq(task.parentTaskId, parentTaskId), eq(task.userId, session.user.id)))
      .orderBy(asc(task.position));

    return subtasks;
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    throw new Error("Failed to fetch subtasks");
  }
}

/**
 * Search tasks by title and description
 *
 * @param query - Search query string
 * @param limit - Maximum results (default 20)
 * @returns Array of matching tasks
 * @throws Error if user is not authenticated
 */
export async function searchTasks(query: string, limit = 20) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to search tasks");
  }

  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const results = await db
      .select({
        task: task,
        project: project,
      })
      .from(task)
      .leftJoin(project, eq(task.projectId, project.id))
      .where(
        and(
          eq(task.userId, session.user.id),
          or(ilike(task.title, `%${query}%`), ilike(task.description, `%${query}%`))!
        )
      )
      .orderBy(desc(task.createdAt))
      .limit(limit);

    return results.map((row) => ({
      ...row.task,
      project: row.project || null,
    }));
  } catch (error) {
    console.error("Error searching tasks:", error);
    throw new Error("Failed to search tasks");
  }
}

/**
 * Get tasks for a specific project
 *
 * @param projectId - Project UUID
 * @param includeCompleted - Include completed tasks (default false)
 * @returns Array of tasks
 * @throws Error if user is not authenticated
 */
export async function getTasksByProject(projectId: string, includeCompleted = false) {
  const filters: TaskFilterInput = {
    projectId,
    sortBy: "position",
    sortOrder: "asc",
  };

  if (!includeCompleted) {
    filters.status = "todo";
  }

  const result = await getTasks(filters);
  return result.tasks;
}

/**
 * Get tasks due today
 *
 * @returns Array of tasks due today
 * @throws Error if user is not authenticated
 */
export async function getTasksDueToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await getTasks({
    dueDateFrom: today,
    dueDateTo: tomorrow,
    sortBy: "dueDate",
    sortOrder: "asc",
  });

  return result.tasks;
}

/**
 * Get overdue tasks
 *
 * @returns Array of overdue incomplete tasks
 * @throws Error if user is not authenticated
 */
export async function getOverdueTasks() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view tasks");
  }

  try {
    const now = new Date();

    const overdueTasks = await db
      .select({
        task: task,
        project: project,
      })
      .from(task)
      .leftJoin(
        link,
        and(
          eq(link.fromType, "task"),
          eq(link.fromId, task.id),
          eq(link.relationship, "assigned_to"),
          eq(link.toType, "project")
        )
      )
      .leftJoin(project, eq(link.toId, project.id))
      .where(and(eq(task.userId, session.user.id), eq(task.status, "todo"), lte(task.dueDate, now)))
      .orderBy(asc(task.dueDate));

    return overdueTasks.map((row) => ({
      ...row.task,
      project: row.project || null,
    }));
  } catch (error) {
    console.error("Error fetching overdue tasks:", error);
    throw new Error("Failed to fetch overdue tasks");
  }
}
