import { z } from "zod";
import { optionalJsonObject } from "@/lib/json-schema";

/**
 * Note validation schemas using Zod
 */

/**
 * Note type enum schema
 */
export const noteTypeSchema = z.enum(["note", "document", "research", "idea", "snippet"], {
  message: "Type must be note, document, research, idea, or snippet",
});

/**
 * Base note schema
 */
const baseNoteSchema = z.object({
  title: z.string().max(500, "Title must be less than 500 characters").trim().optional().nullable(),

  content: z
    .string()
    .max(100000, "Content must be less than 100,000 characters")
    .optional()
    .nullable(),

  // Type
  type: noteTypeSchema.default("note"),

  // Organization
  projectId: z.string().uuid("Invalid project ID").optional().nullable(),
  parentNoteId: z.string().uuid("Invalid parent note ID").optional().nullable(),

  // Favorites
  isFavorite: z.boolean().default(false),

  // Custom metadata
  metadata: optionalJsonObject(),
});

/**
 * Schema for creating a new note
 */
export const createNoteSchema = baseNoteSchema.refine(
  (data) => {
    // At least title or content must be provided
    return (data.title && data.title.length > 0) || (data.content && data.content.length > 0);
  },
  {
    message: "Either title or content must be provided",
    path: ["title"],
  }
);

/**
 * Schema for updating an existing note
 */
export const updateNoteSchema = baseNoteSchema.partial();

/**
 * Tag filter logic enum schema
 */
export const tagFilterLogicSchema = z.enum(["AND", "OR"], {
  message: "Tag filter logic must be AND or OR",
});

/**
 * Schema for note filters
 */
export const noteFilterSchema = z.object({
  type: noteTypeSchema.optional(),
  projectId: z.string().uuid().optional(),
  parentNoteId: z.string().uuid().optional().nullable(),
  isFavorite: z.boolean().optional(),

  // Tag filters
  tagIds: z.array(z.string().uuid()).optional(),
  tagLogic: tagFilterLogicSchema.default("OR").optional(),

  // Search (will search in title and content)
  search: z.string().max(500).optional(),

  // Pagination
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),

  // Sorting
  sortBy: z.enum(["createdAt", "updatedAt", "title"]).default("updatedAt").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

/**
 * Schema for bulk note operations
 */
export const bulkNoteOperationSchema = z.object({
  noteIds: z.array(z.string().uuid()).min(1, "At least one note ID is required"),
  operation: z.enum(["delete", "favorite", "unfavorite", "updateType", "moveToProject"]),
  // Optional data for specific operations
  type: noteTypeSchema.optional(),
  projectId: z.string().uuid().optional().nullable(),
});

/**
 * Inferred TypeScript types
 */
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type NoteFilterInput = z.infer<typeof noteFilterSchema>;
export type BulkNoteOperationInput = z.infer<typeof bulkNoteOperationSchema>;
export type NoteType = z.infer<typeof noteTypeSchema>;
