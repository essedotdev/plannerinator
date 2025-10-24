/**
 * Runtime type guards for validating data
 *
 * Type guards provide runtime validation and type narrowing for TypeScript.
 * They are essential for validating data from external sources (API, database, forms).
 */

import type { Task, Event, Note, Project, Collection, CollectionItem } from "@/db/schema";
import type { Role } from "@/types/auth";
import {
  taskStatusSchema,
  taskPrioritySchema,
  type TaskStatus,
  type TaskPriority,
} from "@/features/tasks/schema";
import { eventCalendarTypeSchema, type EventCalendarType } from "@/features/events/schema";
import { noteTypeSchema, type NoteType } from "@/features/notes/schema";
import { projectStatusSchema, type ProjectStatus } from "@/features/projects/schema";

/**
 * Type guard for Role
 */
export function isRole(value: unknown): value is Role {
  return value === "user" || value === "admin";
}

/**
 * Type guard for TaskStatus
 */
export function isTaskStatus(value: unknown): value is TaskStatus {
  const result = taskStatusSchema.safeParse(value);
  return result.success;
}

/**
 * Type guard for TaskPriority
 */
export function isTaskPriority(value: unknown): value is TaskPriority {
  const result = taskPrioritySchema.safeParse(value);
  return result.success;
}

/**
 * Type guard for EventCalendarType
 */
export function isEventCalendarType(value: unknown): value is EventCalendarType {
  const result = eventCalendarTypeSchema.safeParse(value);
  return result.success;
}

/**
 * Type guard for NoteType
 */
export function isNoteType(value: unknown): value is NoteType {
  const result = noteTypeSchema.safeParse(value);
  return result.success;
}

/**
 * Type guard for ProjectStatus
 */
export function isProjectStatus(value: unknown): value is ProjectStatus {
  const result = projectStatusSchema.safeParse(value);
  return result.success;
}

/**
 * Type guard for Task entity
 * Validates that an object has all required Task properties
 */
export function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    typeof obj.title === "string" &&
    isTaskStatus(obj.status) &&
    typeof obj.createdAt === "object" &&
    typeof obj.updatedAt === "object"
  );
}

/**
 * Type guard for Event entity
 */
export function isEvent(value: unknown): value is Event {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    typeof obj.title === "string" &&
    typeof obj.startTime === "object" &&
    isEventCalendarType(obj.calendarType) &&
    typeof obj.createdAt === "object" &&
    typeof obj.updatedAt === "object"
  );
}

/**
 * Type guard for Note entity
 */
export function isNote(value: unknown): value is Note {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    isNoteType(obj.type) &&
    typeof obj.createdAt === "object" &&
    typeof obj.updatedAt === "object"
  );
}

/**
 * Type guard for Project entity
 */
export function isProject(value: unknown): value is Project {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    typeof obj.name === "string" &&
    isProjectStatus(obj.status) &&
    typeof obj.color === "string" &&
    typeof obj.createdAt === "object" &&
    typeof obj.updatedAt === "object"
  );
}

/**
 * Type guard for Collection entity
 */
export function isCollection(value: unknown): value is Collection {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    typeof obj.name === "string" &&
    typeof obj.schema === "object" &&
    typeof obj.createdAt === "object" &&
    typeof obj.updatedAt === "object"
  );
}

/**
 * Type guard for CollectionItem entity
 */
export function isCollectionItem(value: unknown): value is CollectionItem {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === "string" &&
    typeof obj.collectionId === "string" &&
    typeof obj.userId === "string" &&
    typeof obj.data === "object" &&
    typeof obj.createdAt === "object" &&
    typeof obj.updatedAt === "object"
  );
}

/**
 * Type guard for arrays of entities
 * Generic helper to validate arrays of a specific type
 */
export function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

/**
 * Type guard for UUID strings
 */
export function isUUID(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Type guard for non-null values
 * Useful for filtering null/undefined from arrays
 */
export function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
