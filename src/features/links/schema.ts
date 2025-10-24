import { z } from "zod";

/**
 * Link Validation Schemas
 *
 * Validates link operations between entities
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
// LINK RELATIONSHIP SCHEMA
// ============================================================================

/**
 * Link relationship enum - matches database enum
 */
export const linkRelationshipSchema = z.enum(
  [
    "assigned_to",
    "related_to",
    "documented_by",
    "scheduled_as",
    "blocks",
    "depends_on",
    "references",
    "inspired_by",
  ],
  { message: "Invalid link relationship type" }
);

export type LinkRelationship = z.infer<typeof linkRelationshipSchema>;

// ============================================================================
// CREATE LINK SCHEMA
// ============================================================================

/**
 * Schema for creating a new link between entities
 */
export const createLinkSchema = z.object({
  fromType: entityTypeSchema,
  fromId: z.string().uuid("Invalid source entity ID"),
  toType: entityTypeSchema,
  toId: z.string().uuid("Invalid target entity ID"),
  relationship: linkRelationshipSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;

// ============================================================================
// UPDATE LINK SCHEMA
// ============================================================================

/**
 * Schema for updating an existing link
 */
export const updateLinkSchema = z.object({
  relationship: linkRelationshipSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

// ============================================================================
// GET ENTITY LINKS SCHEMA
// ============================================================================

/**
 * Schema for fetching links for a specific entity
 */
export const getEntityLinksSchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.string().uuid("Invalid entity ID"),
  direction: z.enum(["from", "to", "both"]).default("both").optional(),
  relationship: linkRelationshipSchema.optional(),
});

export type GetEntityLinksInput = z.infer<typeof getEntityLinksSchema>;

// ============================================================================
// LINK LABELS
// ============================================================================

/**
 * Human-readable labels for link relationships
 */
export const LINK_RELATIONSHIP_LABELS: Record<LinkRelationship, string> = {
  assigned_to: "Assigned to",
  related_to: "Related to",
  documented_by: "Documented by",
  scheduled_as: "Scheduled as",
  blocks: "Blocks",
  depends_on: "Depends on",
  references: "References",
  inspired_by: "Inspired by",
};

/**
 * Descriptions for link relationships
 */
export const LINK_RELATIONSHIP_DESCRIPTIONS: Record<LinkRelationship, string> = {
  assigned_to: "This item is assigned to another item",
  related_to: "General relationship between items",
  documented_by: "This item is documented by a note",
  scheduled_as: "This item is scheduled as an event",
  blocks: "This item blocks another item from progressing",
  depends_on: "This item depends on another item",
  references: "This item references another item",
  inspired_by: "This item was inspired by another item",
};
