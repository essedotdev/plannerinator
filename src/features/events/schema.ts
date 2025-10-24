import { z } from "zod";
import { optionalJsonObject } from "@/lib/json-schema";

/**
 * Event validation schemas using Zod
 */

/**
 * Event calendar type enum schema
 */
export const eventCalendarTypeSchema = z.enum(["personal", "work", "family", "other"], {
  message: "Calendar type must be personal, work, family, or other",
});

/**
 * Base event schema
 */
const baseEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .trim(),

  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .nullable(),

  // Timing (startTime is required)
  startTime: z.coerce.date({ message: "Start time is required" }),
  endTime: z.coerce.date().optional().nullable(),
  allDay: z.boolean().default(false),

  // Location
  location: z.string().max(500, "Location must be less than 500 characters").optional().nullable(),
  locationUrl: z.string().url("Invalid location URL").max(2000).optional().nullable(),

  // Organization
  projectId: z.string().uuid("Invalid project ID").optional().nullable(),

  // Calendar type
  calendarType: eventCalendarTypeSchema.default("personal"),

  // Custom metadata
  metadata: optionalJsonObject(),
});

/**
 * Schema for creating a new event
 */
export const createEventSchema = baseEventSchema
  .omit({
    allDay: true,
    calendarType: true,
  })
  .refine(
    (data) => {
      // If endTime is provided, it must be after startTime
      if (data.endTime && data.startTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

/**
 * Schema for updating an existing event
 */
export const updateEventSchema = baseEventSchema.partial().refine(
  (data) => {
    // If both times are provided, endTime must be after startTime
    if (data.endTime && data.startTime) {
      return data.endTime > data.startTime;
    }
    return true;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

/**
 * Tag filter logic enum schema
 */
export const tagFilterLogicSchema = z.enum(["AND", "OR"], {
  message: "Tag filter logic must be AND or OR",
});

/**
 * Schema for event filters
 */
export const eventFilterSchema = z.object({
  calendarType: eventCalendarTypeSchema.optional(),
  projectId: z.string().uuid().optional(),
  allDay: z.boolean().optional(),

  // Date range filters
  startTimeFrom: z.coerce.date().optional(),
  startTimeTo: z.coerce.date().optional(),

  // Tag filters
  tagIds: z.array(z.string().uuid()).optional(),
  tagLogic: tagFilterLogicSchema.default("OR").optional(),

  // Search
  search: z.string().max(500).optional(),

  // Pagination
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),

  // Sorting
  sortBy: z.enum(["createdAt", "startTime", "title"]).default("startTime").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),
});

/**
 * Inferred TypeScript types
 */
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventFilterInput = z.infer<typeof eventFilterSchema>;
export type EventCalendarType = z.infer<typeof eventCalendarTypeSchema>;
