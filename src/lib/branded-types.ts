/**
 * Branded types for type-safe IDs
 *
 * Branded types use TypeScript's nominal typing to prevent mixing different ID types.
 * This prevents bugs like passing a TaskId where an EventId is expected.
 *
 * @example
 * ```typescript
 * const taskId = "123" as TaskId;
 * const eventId = "456" as EventId;
 *
 * function deleteTask(id: TaskId) { ... }
 *
 * deleteTask(taskId);   // ✅ OK
 * deleteTask(eventId);  // ❌ Type error!
 * deleteTask("123");    // ❌ Type error!
 * ```
 */

/**
 * Base branded type helper
 * Creates a nominal type from a primitive type
 */
type Brand<K, T> = K & { readonly __brand: T };

/**
 * User ID (from Better Auth)
 */
export type UserId = Brand<string, "UserId">;

/**
 * Task ID
 */
export type TaskId = Brand<string, "TaskId">;

/**
 * Event ID
 */
export type EventId = Brand<string, "EventId">;

/**
 * Note ID
 */
export type NoteId = Brand<string, "NoteId">;

/**
 * Project ID
 */
export type ProjectId = Brand<string, "ProjectId">;

/**
 * Collection ID
 */
export type CollectionId = Brand<string, "CollectionId">;

/**
 * Collection Item ID
 */
export type CollectionItemId = Brand<string, "CollectionItemId">;

/**
 * Link ID
 */
export type LinkId = Brand<string, "LinkId">;

/**
 * Tag ID
 */
export type TagId = Brand<string, "TagId">;

/**
 * Entity Tag ID
 */
export type EntityTagId = Brand<string, "EntityTagId">;

/**
 * Comment ID
 */
export type CommentId = Brand<string, "CommentId">;

/**
 * Activity Log ID
 */
export type ActivityLogId = Brand<string, "ActivityLogId">;

/**
 * Helper functions to create branded IDs from strings
 * These perform runtime validation before branding
 */

import { isUUID } from "./type-guards";

/**
 * Creates a branded ID from a string
 * Validates that the string is a valid UUID
 *
 * @throws Error if the string is not a valid UUID
 */
function createBrandedId<T extends string>(value: string, brand: string): Brand<string, T> {
  if (!isUUID(value)) {
    throw new Error(`Invalid ${brand}: ${value} is not a valid UUID`);
  }
  return value as Brand<string, T>;
}

/**
 * Safe branded ID creators
 * These validate UUIDs before branding
 */
export const toUserId = (value: string): UserId => createBrandedId<"UserId">(value, "UserId");
export const toTaskId = (value: string): TaskId => createBrandedId<"TaskId">(value, "TaskId");
export const toEventId = (value: string): EventId => createBrandedId<"EventId">(value, "EventId");
export const toNoteId = (value: string): NoteId => createBrandedId<"NoteId">(value, "NoteId");
export const toProjectId = (value: string): ProjectId =>
  createBrandedId<"ProjectId">(value, "ProjectId");
export const toCollectionId = (value: string): CollectionId =>
  createBrandedId<"CollectionId">(value, "CollectionId");
export const toCollectionItemId = (value: string): CollectionItemId =>
  createBrandedId<"CollectionItemId">(value, "CollectionItemId");
export const toLinkId = (value: string): LinkId => createBrandedId<"LinkId">(value, "LinkId");
export const toTagId = (value: string): TagId => createBrandedId<"TagId">(value, "TagId");
export const toEntityTagId = (value: string): EntityTagId =>
  createBrandedId<"EntityTagId">(value, "EntityTagId");
export const toCommentId = (value: string): CommentId =>
  createBrandedId<"CommentId">(value, "CommentId");
export const toActivityLogId = (value: string): ActivityLogId =>
  createBrandedId<"ActivityLogId">(value, "ActivityLogId");

/**
 * Unsafe branded ID creators (no validation)
 * Use only when you're certain the value is valid (e.g., from database)
 *
 * @example
 * ```typescript
 * // From database query (already validated)
 * const task = await db.query.task.findFirst({ where: ... });
 * const taskId = unsafeToTaskId(task.id);
 * ```
 */
export const unsafeToUserId = (value: string): UserId => value as UserId;
export const unsafeToTaskId = (value: string): TaskId => value as TaskId;
export const unsafeToEventId = (value: string): EventId => value as EventId;
export const unsafeToNoteId = (value: string): NoteId => value as NoteId;
export const unsafeToProjectId = (value: string): ProjectId => value as ProjectId;
export const unsafeToCollectionId = (value: string): CollectionId => value as CollectionId;
export const unsafeToCollectionItemId = (value: string): CollectionItemId =>
  value as CollectionItemId;
export const unsafeToLinkId = (value: string): LinkId => value as LinkId;
export const unsafeToTagId = (value: string): TagId => value as TagId;
export const unsafeToEntityTagId = (value: string): EntityTagId => value as EntityTagId;
export const unsafeToCommentId = (value: string): CommentId => value as CommentId;
export const unsafeToActivityLogId = (value: string): ActivityLogId => value as ActivityLogId;

/**
 * Helper to convert branded ID back to string
 * (useful for database queries)
 *
 * Generic type accepts any Brand<string, X> where X is unknown
 */
export const fromBrandedId = <T extends string>(id: Brand<T, string>): string => id as string;
