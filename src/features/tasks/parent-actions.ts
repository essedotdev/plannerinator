"use server";

import { getTasks } from "./queries";

/**
 * Server action to get tasks for parent selection
 * Used by client components (TaskForm)
 */
export async function getTasksForParentSelection(excludeId?: string) {
  try {
    const result = await getTasks({
      sortBy: "title",
      sortOrder: "asc",
      limit: 100,
    });

    // Filter out the current task if provided
    const filteredTasks = excludeId ? result.tasks.filter((t) => t.id !== excludeId) : result.tasks;

    return {
      success: true,
      tasks: filteredTasks,
    };
  } catch (error) {
    console.error("Failed to load tasks:", error);
    return {
      success: false,
      tasks: [],
    };
  }
}
