/**
 * User-friendly labels for database enum values
 *
 * Maps raw database values to human-readable labels for display in UI
 */

// ============================================================================
// TASK LABELS
// ============================================================================

export const TASK_STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
} as const;

export const TASK_PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
} as const;

// ============================================================================
// EVENT LABELS
// ============================================================================

export const EVENT_CALENDAR_TYPE_LABELS = {
  personal: "Personal",
  work: "Work",
  family: "Family",
  other: "Other",
} as const;

// ============================================================================
// PROJECT LABELS
// ============================================================================

export const PROJECT_STATUS_LABELS = {
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  archived: "Archived",
  cancelled: "Cancelled",
} as const;

// ============================================================================
// NOTE LABELS
// ============================================================================

export const NOTE_TYPE_LABELS = {
  note: "Note",
  document: "Document",
  research: "Research",
  idea: "Idea",
  snippet: "Snippet",
} as const;
