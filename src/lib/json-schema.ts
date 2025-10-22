import { z } from "zod";

/**
 * Type-safe JSON schema for Zod validation
 *
 * This replaces unsafe `z.any()` with a proper recursive JSON type
 * that matches what PostgreSQL JSONB can store.
 */

/**
 * JsonValue type - represents any valid JSON value
 */
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * Zod schema for JSON values
 * Recursively validates JSON structure without using `any`
 */
export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
);

/**
 * Zod schema for JSON objects (the most common case for metadata fields)
 */
export const jsonObjectSchema = z.record(z.string(), jsonValueSchema);

/**
 * Helper to create an optional JSON object field with default empty object
 * Common pattern for metadata fields
 */
export const optionalJsonObject = () => jsonObjectSchema.default({}).optional();
