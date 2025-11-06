/**
 * AI Tool Handlers
 *
 * These functions execute the actual operations requested by the AI.
 * They bridge between AI tool calls and existing server actions.
 */

import { createTask } from "@/features/tasks/actions";
import { createEvent } from "@/features/events/actions";
import { createNote } from "@/features/notes/actions";
import { createProject } from "@/features/projects/actions";
import { updateTask, markTaskComplete } from "@/features/tasks/actions";
import { deleteTask } from "@/features/tasks/actions";
import { deleteEvent } from "@/features/events/actions";
import { deleteNote } from "@/features/notes/actions";
import { deleteProject } from "@/features/projects/actions";
import { globalSearch } from "@/features/search/queries";
import { db } from "@/db";
import { task, event } from "@/db/schema";
import { eq, and, gte, lt, ne, sql } from "drizzle-orm";
import type {
  ToolResult,
  CreateTaskInput,
  CreateEventInput,
  CreateNoteInput,
  CreateProjectInput,
  SearchEntitiesInput,
  UpdateTaskInput,
  DeleteEntityInput,
  GetStatisticsInput,
} from "./types";

/**
 * Execute a tool call from Claude
 */
export async function executeToolCall(
  toolName: string,
  toolInput: unknown,
  userId: string
): Promise<ToolResult> {
  try {
    switch (toolName) {
      case "create_task":
        return await handleCreateTasks((toolInput as { tasks: CreateTaskInput[] }).tasks);

      case "create_event":
        return await handleCreateEvents((toolInput as { events: CreateEventInput[] }).events);

      case "create_note":
        return await handleCreateNote(toolInput as CreateNoteInput);

      case "create_project":
        return await handleCreateProject(toolInput as CreateProjectInput);

      case "search_entities":
        return await handleSearchEntities(toolInput as SearchEntitiesInput);

      case "update_task":
        return await handleUpdateTask(toolInput as UpdateTaskInput);

      case "delete_entity":
        return await handleDeleteEntity(toolInput as DeleteEntityInput);

      case "get_statistics":
        return await handleGetStatistics(toolInput as GetStatisticsInput, userId);

      default:
        return {
          success: false,
          error: `Unknown tool: ${toolName}`,
        };
    }
  } catch (error) {
    console.error(`Tool execution error (${toolName}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Tool execution failed",
    };
  }
}

/**
 * Handle create_task tool
 */
async function handleCreateTasks(tasks: CreateTaskInput[]): Promise<ToolResult> {
  const results = [];
  const errors = [];

  for (const taskData of tasks) {
    try {
      // Resolve project by name if provided
      let projectId = null;
      if (taskData.projectName) {
        const searchResults = await globalSearch(taskData.projectName, {
          entityTypes: ["project"],
          limit: 1,
        });
        const foundProject = searchResults.projects?.[0];
        if (foundProject) {
          projectId = foundProject.id;
        }
      }

      // Parse due date
      const dueDate = taskData.dueDate ? new Date(taskData.dueDate) : null;

      // Create task using existing action
      const result = await createTask({
        title: taskData.title,
        description: taskData.description || null,
        dueDate,
        duration: taskData.duration || null,
        priority: taskData.priority || "medium",
        projectId,
        status: "todo",
      });

      if (result.success) {
        results.push({
          id: result.task.id,
          title: result.task.title,
          dueDate: result.task.dueDate,
          priority: result.task.priority,
          project: taskData.projectName || null,
        });
      } else {
        errors.push(`Failed to create task "${taskData.title}"`);
      }
    } catch (error) {
      errors.push(`Error creating task "${taskData.title}": ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    data: {
      created: results.length,
      tasks: results,
      errors: errors.length > 0 ? errors : undefined,
    },
  };
}

/**
 * Handle create_event tool
 */
async function handleCreateEvents(events: CreateEventInput[]): Promise<ToolResult> {
  const results = [];
  const errors = [];

  for (const eventData of events) {
    try {
      // Resolve project
      let projectId = null;
      if (eventData.projectName) {
        const searchResults = await globalSearch(eventData.projectName, {
          entityTypes: ["project"],
          limit: 1,
        });
        const foundProject = searchResults.projects?.[0];
        if (foundProject) {
          projectId = foundProject.id;
        }
      }

      // Parse dates
      const startTime = new Date(eventData.startTime);
      const endTime = eventData.endTime
        ? new Date(eventData.endTime)
        : new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour

      const result = await createEvent({
        title: eventData.title,
        description: eventData.description || null,
        startTime,
        endTime,
        location: eventData.location || null,
        allDay: eventData.allDay || false,
        projectId,
        calendarType: "event",
      });

      if (result.success) {
        results.push({
          id: result.event.id,
          title: result.event.title,
          startTime: result.event.startTime,
          endTime: result.event.endTime,
        });
      } else {
        errors.push(`Failed to create event "${eventData.title}"`);
      }
    } catch (error) {
      errors.push(`Error creating event "${eventData.title}": ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    data: {
      created: results.length,
      events: results,
      errors: errors.length > 0 ? errors : undefined,
    },
  };
}

/**
 * Handle create_note tool
 */
async function handleCreateNote(input: CreateNoteInput): Promise<ToolResult> {
  try {
    // Resolve project
    let projectId = null;
    if (input.projectName) {
      const searchResults = await globalSearch(input.projectName, {
        entityTypes: ["project"],
        limit: 1,
      });
      const foundProject = searchResults.projects?.[0];
      if (foundProject) {
        projectId = foundProject.id;
      }
    }

    // Generate title from content if not provided
    const title =
      input.title ||
      input.content.split("\n")[0].substring(0, 100).replace(/^#\s*/, "") ||
      "Untitled Note";

    const result = await createNote({
      title,
      content: input.content,
      type: input.type || "note",
      projectId,
    });

    return {
      success: result.success,
      data: {
        notes: [
          {
            id: result.note.id,
            title: result.note.title,
            type: result.note.type,
          },
        ],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create note: ${error}`,
    };
  }
}

/**
 * Handle create_project tool
 */
async function handleCreateProject(input: CreateProjectInput): Promise<ToolResult> {
  try {
    // Generate random color if not provided
    const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#6366f1"];
    const color = input.color || colors[Math.floor(Math.random() * colors.length)];

    const result = await createProject({
      name: input.name,
      description: input.description || null,
      status: input.status || "planning",
      color,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
    });

    return {
      success: result.success,
      data: {
        projects: [
          {
            id: result.project.id,
            name: result.project.name,
            status: result.project.status,
            color: result.project.color,
          },
        ],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create project: ${error}`,
    };
  }
}

/**
 * Handle search_entities tool
 */
async function handleSearchEntities(input: SearchEntitiesInput): Promise<ToolResult> {
  try {
    const limit = Math.min(input.limit || 10, 50);
    const results = await globalSearch(input.query, {
      limit,
      entityTypes: input.entityTypes,
    });

    // Filter by entity types if specified
    let filteredResults = results;
    if (input.entityTypes && input.entityTypes.length > 0) {
      const tasks = input.entityTypes.includes("task") ? results.tasks : [];
      const events = input.entityTypes.includes("event") ? results.events : [];
      const notes = input.entityTypes.includes("note") ? results.notes : [];
      const projects = input.entityTypes.includes("project") ? results.projects : [];

      filteredResults = {
        tasks,
        events,
        notes,
        projects,
        total: tasks.length + events.length + notes.length + projects.length,
      };
    }

    // Calculate total
    const total =
      filteredResults.tasks.length +
      filteredResults.events.length +
      filteredResults.notes.length +
      filteredResults.projects.length;

    return {
      success: true,
      data: {
        total,
        results: filteredResults,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Search failed: ${error}`,
    };
  }
}

/**
 * Handle update_task tool
 */
async function handleUpdateTask(input: UpdateTaskInput): Promise<ToolResult> {
  try {
    // Try to find task by ID or title
    let taskId = input.taskIdentifier;

    // If not a UUID, search by title
    if (!taskId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const searchResults = await globalSearch(input.taskIdentifier, {
        entityTypes: ["task"],
        limit: 10,
      });
      if (searchResults.tasks.length === 0) {
        return {
          success: false,
          error: `No task found matching "${input.taskIdentifier}"`,
        };
      }
      if (searchResults.tasks.length > 1) {
        return {
          success: false,
          error: `Multiple tasks found matching "${input.taskIdentifier}". Please be more specific.`,
          data: {
            matches: searchResults.tasks.map((t) => ({
              id: t.id,
              title: t.title,
            })),
          },
        };
      }
      taskId = searchResults.tasks[0].id;
    }

    // If updating status to "done", use markTaskComplete
    if (input.updates.status === "done") {
      const result = await markTaskComplete(taskId);
      return {
        success: result.success,
        data: {
          message: `Task "${result.task.title}" marked as complete`,
        },
      };
    }

    // Otherwise use updateTask
    const updates: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: Date;
    } = {};
    if (input.updates.title) updates.title = input.updates.title;
    if (input.updates.description) updates.description = input.updates.description;
    if (input.updates.status) updates.status = input.updates.status;
    if (input.updates.priority) updates.priority = input.updates.priority;
    if (input.updates.dueDate) updates.dueDate = new Date(input.updates.dueDate);

    const result = await updateTask(taskId, updates);

    return {
      success: result.success,
      data: {
        message: `Task "${result.task.title}" updated successfully`,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to update task: ${error}`,
    };
  }
}

/**
 * Handle delete_entity tool
 */
async function handleDeleteEntity(input: DeleteEntityInput): Promise<ToolResult> {
  try {
    const { entityType, entityIdentifier } = input;

    // Find entity ID by identifier
    let entityId = entityIdentifier;

    // If not UUID, search
    if (!entityId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const searchResults = await globalSearch(entityIdentifier, {
        entityTypes: [entityType],
        limit: 10,
      });
      const entityKey = `${entityType}s` as "tasks" | "events" | "notes" | "projects";
      const entities = searchResults[entityKey];

      if (entities.length === 0) {
        return {
          success: false,
          error: `No ${entityType} found matching "${entityIdentifier}"`,
        };
      }
      if (entities.length > 1) {
        return {
          success: false,
          error: `Multiple ${entityType}s found. Please be more specific.`,
        };
      }
      entityId = entities[0].id;
    }

    // Execute delete based on entity type
    let result;
    switch (entityType) {
      case "task":
        result = await deleteTask(entityId);
        break;
      case "event":
        result = await deleteEvent(entityId);
        break;
      case "note":
        result = await deleteNote(entityId);
        break;
      case "project":
        result = await deleteProject(entityId);
        break;
      default:
        return {
          success: false,
          error: `Unknown entity type: ${entityType}`,
        };
    }

    return {
      success: result.success,
      data: {
        message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} deleted successfully`,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to delete: ${error}`,
    };
  }
}

/**
 * Handle get_statistics tool
 */
async function handleGetStatistics(input: GetStatisticsInput, userId: string): Promise<ToolResult> {
  try {
    const { metric, projectName } = input;

    // Resolve project if specified
    let projectId = null;
    if (projectName) {
      const searchResults = await globalSearch(projectName, {
        entityTypes: ["project"],
        limit: 1,
      });
      const foundProject = searchResults.projects?.[0];
      if (foundProject) {
        projectId = foundProject.id;
      }
    }

    switch (metric) {
      case "tasks_completed_today": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const whereConditions = [
          eq(task.userId, userId),
          eq(task.status, "done"),
          gte(task.completedAt, today),
        ];
        if (projectId) whereConditions.push(eq(task.projectId, projectId));

        const count = await db
          .select({ count: sql<number>`count(*)` })
          .from(task)
          .where(and(...whereConditions));

        return {
          success: true,
          data: {
            metric: "tasks_completed_today",
            value: Number(count[0].count),
          },
        };
      }

      case "tasks_completed_this_week": {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const whereConditions = [
          eq(task.userId, userId),
          eq(task.status, "done"),
          gte(task.completedAt, weekStart),
        ];
        if (projectId) whereConditions.push(eq(task.projectId, projectId));

        const count = await db
          .select({ count: sql<number>`count(*)` })
          .from(task)
          .where(and(...whereConditions));

        return {
          success: true,
          data: {
            metric: "tasks_completed_this_week",
            value: Number(count[0].count),
          },
        };
      }

      case "overdue_tasks": {
        const now = new Date();

        const whereConditions = [
          eq(task.userId, userId),
          ne(task.status, "done"),
          lt(task.dueDate, now),
        ];
        if (projectId) whereConditions.push(eq(task.projectId, projectId));

        const overdueTasks = await db
          .select()
          .from(task)
          .where(and(...whereConditions))
          .limit(10);

        return {
          success: true,
          data: {
            metric: "overdue_tasks",
            count: overdueTasks.length,
            tasks: overdueTasks.map((t) => ({
              id: t.id,
              title: t.title,
              dueDate: t.dueDate,
              priority: t.priority,
            })),
          },
        };
      }

      case "upcoming_events": {
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const whereConditions = [
          eq(event.userId, userId),
          gte(event.startTime, now),
          lt(event.startTime, weekFromNow),
        ];
        if (projectId) whereConditions.push(eq(event.projectId, projectId));

        const upcomingEvents = await db
          .select()
          .from(event)
          .where(and(...whereConditions))
          .limit(10);

        return {
          success: true,
          data: {
            metric: "upcoming_events",
            count: upcomingEvents.length,
            events: upcomingEvents.map((e) => ({
              id: e.id,
              title: e.title,
              startTime: e.startTime,
              location: e.location,
            })),
          },
        };
      }

      case "tasks_by_status": {
        const whereConditions = [eq(task.userId, userId)];
        if (projectId) whereConditions.push(eq(task.projectId, projectId));

        const tasks = await db
          .select()
          .from(task)
          .where(and(...whereConditions));

        const byStatus = tasks.reduce(
          (acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        return {
          success: true,
          data: {
            metric: "tasks_by_status",
            breakdown: byStatus,
            total: tasks.length,
          },
        };
      }

      default:
        return {
          success: false,
          error: `Unknown metric: ${metric}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to get statistics: ${error}`,
    };
  }
}
