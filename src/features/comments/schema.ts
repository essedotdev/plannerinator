import { z } from "zod";

/**
 * Comment Validation Schemas
 *
 * Validates comment operations for all entities
 */

// ============================================================================
// ENTITY TYPE SCHEMA
// ============================================================================

/**
 * Entity type enum - matches database enum
 */
export const entityTypeSchema = z.enum(["task", "event", "note", "project", "collection_item"], {
  message: "Entity type must be task, event, note, project, or collection_item",
});

export type EntityType = z.infer<typeof entityTypeSchema>;

// ============================================================================
// CREATE COMMENT SCHEMA
// ============================================================================

/**
 * Schema for creating a new comment
 */
export const createCommentSchema = z.object({
  content: z
    .string({ message: "Comment content is required" })
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment must be less than 5000 characters"),
  entityType: entityTypeSchema,
  entityId: z.string().uuid("Invalid entity ID"),
  parentCommentId: z.string().uuid("Invalid parent comment ID").optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

// ============================================================================
// UPDATE COMMENT SCHEMA
// ============================================================================

/**
 * Schema for updating an existing comment
 */
export const updateCommentSchema = z.object({
  content: z
    .string({ message: "Comment content is required" })
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment must be less than 5000 characters"),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

// ============================================================================
// GET ENTITY COMMENTS SCHEMA
// ============================================================================

/**
 * Schema for fetching comments for a specific entity
 */
export const getEntityCommentsSchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.string().uuid("Invalid entity ID"),
  limit: z.number().int().positive().max(100).default(50).optional(),
  offset: z.number().int().nonnegative().default(0).optional(),
});

export type GetEntityCommentsInput = z.infer<typeof getEntityCommentsSchema>;
