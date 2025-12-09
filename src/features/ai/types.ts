/**
 * AI Feature Types
 *
 * Type definitions for AI tool inputs and outputs.
 */

/**
 * Tool call result type
 */
export type ToolResult = {
  success: boolean;
  data?: {
    created?: number;
    count?: number;
    total?: number;
    tasks?: Array<{ id: string; title: string; dueDate?: Date | null; priority?: string | null }>;
    events?: Array<{ id: string; title: string; startTime?: Date; endTime?: Date | null }>;
    notes?: Array<{ id: string; title: string | null; type?: string }>;
    projects?: Array<{ id: string; name: string; status?: string; color?: string }>;
    results?: unknown;
    message?: string;
    metric?: string;
    value?: number;
    breakdown?: Record<string, number>;
    matches?: Array<{ id: string; title: string }>;
    errors?: string[];
  };
  error?: string;
};

/**
 * Task creation input
 */
export type CreateTaskInput = {
  title: string;
  description?: string;
  dueDate?: string;
  duration?: number;
  priority?: "low" | "medium" | "high" | "urgent";
  projectName?: string;
  tags?: string[];
};

/**
 * Event creation input
 */
export type CreateEventInput = {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  allDay?: boolean;
  projectName?: string;
  tags?: string[];
};

/**
 * Note creation input
 */
export type CreateNoteInput = {
  title?: string;
  content: string;
  type?: "note" | "document" | "research" | "idea" | "snippet";
  projectName?: string;
  tags?: string[];
};

/**
 * Project creation input
 */
export type CreateProjectInput = {
  name: string;
  description?: string;
  status?: "active" | "on_hold" | "completed" | "archived" | "cancelled";
  color?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
};

/**
 * Query entities input (list without search)
 */
export type QueryEntitiesInput = {
  entityTypes: Array<"task" | "event" | "note" | "project">;
  filters?: {
    status?: "todo" | "in_progress" | "done" | "cancelled";
    priority?: "low" | "medium" | "high" | "urgent";
    projectStatus?: "active" | "on_hold" | "completed" | "archived" | "cancelled";
    projectName?: string;
    dateRange?: {
      start?: string;
      end?: string;
    };
  };
  sortBy?: "createdAt" | "updatedAt" | "dueDate" | "startTime" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
};

/**
 * Search entities input
 */
export type SearchEntitiesInput = {
  query: string;
  entityTypes?: Array<"task" | "event" | "note" | "project">;
  filters?: {
    status?: "todo" | "in_progress" | "done" | "cancelled";
    priority?: "low" | "medium" | "high" | "urgent";
    projectStatus?: "active" | "on_hold" | "completed" | "archived" | "cancelled";
    projectName?: string;
    tags?: string[];
    dateRange?: {
      start?: string;
      end?: string;
    };
  };
  limit?: number;
};

/**
 * Update task input
 */
export type UpdateTaskInput = {
  taskIdentifier: string;
  updates: {
    title?: string;
    description?: string;
    status?: "todo" | "in_progress" | "done" | "cancelled";
    dueDate?: string;
    priority?: "low" | "medium" | "high" | "urgent";
  };
};

/**
 * Update event input
 */
export type UpdateEventInput = {
  eventIdentifier: string;
  updates: {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    allDay?: boolean;
  };
};

/**
 * Update note input
 */
export type UpdateNoteInput = {
  noteIdentifier: string;
  updates: {
    title?: string;
    content?: string;
    type?: "note" | "document" | "research" | "idea" | "snippet";
  };
};

/**
 * Update project input
 */
export type UpdateProjectInput = {
  projectIdentifier: string;
  updates: {
    name?: string;
    description?: string;
    status?: "planning" | "active" | "on_hold" | "completed" | "cancelled";
    color?: string;
    startDate?: string;
    endDate?: string;
  };
};

/**
 * Delete entity input
 */
export type DeleteEntityInput = {
  entityType: "task" | "event" | "note" | "project";
  entityIdentifier: string;
};

/**
 * Get statistics input
 */
export type GetStatisticsInput = {
  metric:
    | "tasks_completed_today"
    | "tasks_completed_this_week"
    | "tasks_completed_this_month"
    | "overdue_tasks"
    | "upcoming_events"
    | "project_progress"
    | "tasks_by_priority"
    | "tasks_by_status";
  projectName?: string;
};

/**
 * Union type for all tool inputs
 */
export type ToolInput =
  | { tasks: CreateTaskInput[] }
  | { events: CreateEventInput[] }
  | CreateNoteInput
  | CreateProjectInput
  | QueryEntitiesInput
  | SearchEntitiesInput
  | UpdateTaskInput
  | UpdateEventInput
  | UpdateNoteInput
  | UpdateProjectInput
  | DeleteEntityInput
  | GetStatisticsInput;
