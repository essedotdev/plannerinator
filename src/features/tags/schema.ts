import { z } from "zod";

/**
 * Tag validation schemas using Zod
 */

/**
 * Entity type enum schema
 */
export const entityTypeSchema = z.enum(["task", "event", "note", "project", "collection_item"], {
  message: "Entity type must be task, event, note, project, or collection_item",
});

/**
 * Hex color validation
 */
const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g., #3b82f6)")
  .default("#6b7280");

/**
 * Base tag schema
 */
const baseTagSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")
    .trim(),

  color: hexColorSchema,
});

/**
 * Schema for creating a new tag
 */
export const createTagSchema = baseTagSchema;

/**
 * Schema for updating an existing tag
 */
export const updateTagSchema = baseTagSchema.partial();

/**
 * Schema for tag filters
 */
export const tagFilterSchema = z.object({
  search: z.string().max(500).optional(),

  // Pagination
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),

  // Sorting
  sortBy: z.enum(["name", "createdAt"]).default("name").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),
});

/**
 * Schema for assigning tags to entities
 */
export const assignTagSchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.string().uuid("Invalid entity ID"),
  tagIds: z.array(z.string().uuid("Invalid tag ID")).min(1, "At least one tag is required"),
});

/**
 * Schema for removing tags from entities
 */
export const removeTagSchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.string().uuid("Invalid entity ID"),
  tagIds: z.array(z.string().uuid("Invalid tag ID")).min(1, "At least one tag is required"),
});

/**
 * Schema for getting entity tags
 */
export const getEntityTagsSchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.string().uuid("Invalid entity ID"),
});

/**
 * Inferred TypeScript types
 */
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type TagFilterInput = z.infer<typeof tagFilterSchema>;
export type AssignTagInput = z.infer<typeof assignTagSchema>;
export type RemoveTagInput = z.infer<typeof removeTagSchema>;
export type GetEntityTagsInput = z.infer<typeof getEntityTagsSchema>;
export type EntityType = z.infer<typeof entityTypeSchema>;
