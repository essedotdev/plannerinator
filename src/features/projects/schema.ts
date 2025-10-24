import { z } from "zod";
import { optionalJsonObject } from "@/lib/json-schema";

/**
 * Project validation schemas using Zod
 */

/**
 * Project status enum schema
 */
export const projectStatusSchema = z.enum(
  ["active", "on_hold", "completed", "archived", "cancelled"],
  {
    message: "Status must be active, on_hold, completed, archived, or cancelled",
  }
);

/**
 * Hex color validation
 */
const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g., #3b82f6)")
  .default("#3b82f6");

/**
 * Base project schema
 */
const baseProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters")
    .trim(),

  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .nullable(),

  // Status
  status: projectStatusSchema.default("active"),

  // Timeline
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),

  // Visual
  color: hexColorSchema,
  icon: z.string().max(100, "Icon must be less than 100 characters").optional().nullable(),

  // Organization
  parentProjectId: z.string().uuid("Invalid parent project ID").optional().nullable(),

  // Custom metadata
  metadata: optionalJsonObject(),
});

/**
 * Schema for creating a new project
 */
export const createProjectSchema = baseProjectSchema
  .omit({
    status: true,
    color: true,
  })
  .refine(
    (data) => {
      // If both dates are provided, endDate must be after startDate
      if (data.endDate && data.startDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

/**
 * Schema for updating an existing project
 */
export const updateProjectSchema = baseProjectSchema.partial().refine(
  (data) => {
    // If both dates are provided, endDate must be after startDate
    if (data.endDate && data.startDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  },
  {
    message: "End date must be on or after start date",
    path: ["endDate"],
  }
);

/**
 * Tag filter logic enum schema
 */
export const tagFilterLogicSchema = z.enum(["AND", "OR"], {
  message: "Tag filter logic must be AND or OR",
});

/**
 * Schema for project filters
 */
export const projectFilterSchema = z.object({
  status: projectStatusSchema.optional(),
  parentProjectId: z.string().uuid().optional().nullable(),

  // Date filters
  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional(),
  endDateFrom: z.coerce.date().optional(),
  endDateTo: z.coerce.date().optional(),

  // Tag filters
  tagIds: z.array(z.string().uuid()).optional(),
  tagLogic: tagFilterLogicSchema.default("OR").optional(),

  // Search
  search: z.string().max(500).optional(),

  // Pagination
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),

  // Sorting
  sortBy: z.enum(["createdAt", "updatedAt", "name", "startDate"]).default("updatedAt").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

/**
 * Schema for project statistics
 */
export const projectStatsSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  includeSubprojects: z.boolean().default(false).optional(),
});

/**
 * Inferred TypeScript types
 */
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectFilterInput = z.infer<typeof projectFilterSchema>;
export type ProjectStatsInput = z.infer<typeof projectStatsSchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
