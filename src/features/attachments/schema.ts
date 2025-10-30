import { z } from "zod";
import { optionalJsonObject } from "@/lib/json-schema";

/**
 * Attachment validation schemas using Zod
 */

/**
 * Allowed MIME types for attachments
 */
export const ALLOWED_MIME_TYPES = [
  // Images
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
  "text/csv",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  // Media
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
] as const;

/**
 * File type categories for icon display
 */
export const FILE_TYPE_CATEGORIES = {
  image: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  spreadsheet: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ],
  presentation: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  text: ["text/plain", "text/markdown"],
  archive: [
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
  ],
  video: ["video/mp4", "video/mpeg", "video/quicktime", "video/webm"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
} as const;

/**
 * Get file type category from MIME type
 */
export function getFileCategory(mimeType: string): keyof typeof FILE_TYPE_CATEGORIES | "other" {
  for (const [category, types] of Object.entries(FILE_TYPE_CATEGORIES)) {
    if (types.includes(mimeType as never)) {
      return category as keyof typeof FILE_TYPE_CATEGORIES;
    }
  }
  return "other";
}

/**
 * Check if MIME type is an image
 */
export function isImageMimeType(mimeType: string): boolean {
  return FILE_TYPE_CATEGORIES.image.includes(mimeType as never);
}

/**
 * Entity type enum schema (must match database entityTypeEnum)
 */
export const attachmentEntityTypeSchema = z.enum(
  ["task", "event", "note", "project", "collection_item"],
  {
    message: "Entity type must be task, event, note, project, or collection_item",
  }
);

/**
 * Base attachment schema
 */
const baseAttachmentSchema = z.object({
  entityType: attachmentEntityTypeSchema,
  entityId: z.string().uuid("Invalid entity ID"),

  // File metadata (provided by client on upload)
  fileName: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name must be less than 255 characters")
    .trim(),

  fileSize: z
    .number()
    .int("File size must be an integer")
    .min(1, "File size must be at least 1 byte")
    .max(10 * 1024 * 1024, "File size must not exceed 10MB"), // 10MB max per file

  mimeType: z.string().refine((val) => ALLOWED_MIME_TYPES.includes(val as never), {
    message: `MIME type must be one of: ${ALLOWED_MIME_TYPES.join(", ")}`,
  }),

  // Custom metadata (optional)
  metadata: optionalJsonObject(),
});

/**
 * Schema for creating a new attachment (before R2 upload)
 *
 * Used to validate client-side file metadata before initiating upload.
 * storageKey and storageUrl are generated server-side after R2 upload.
 */
export const createAttachmentSchema = baseAttachmentSchema;

/**
 * Schema for attachment upload response
 *
 * Returned after successful R2 upload with generated storage info.
 */
export const attachmentUploadResponseSchema = baseAttachmentSchema.extend({
  id: z.string().uuid(),
  userId: z.string(),
  storageKey: z.string(),
  storageUrl: z.string().url().optional().nullable(),
  createdAt: z.date(),
});

/**
 * Schema for updating an attachment
 *
 * Only fileName and metadata can be updated.
 * File content (storageKey) is immutable - delete and re-upload instead.
 */
export const updateAttachmentSchema = z.object({
  fileName: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name must be less than 255 characters")
    .trim()
    .optional(),
  metadata: optionalJsonObject(),
});

/**
 * Schema for attachment filters
 */
export const attachmentFilterSchema = z.object({
  entityType: attachmentEntityTypeSchema.optional(),
  entityId: z.string().uuid().optional(),

  // File type filtering
  mimeType: z.string().optional(),
  category: z
    .enum(["image", "document", "spreadsheet", "presentation", "text", "archive", "video", "audio"])
    .optional(),

  // Pagination
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),

  // Sorting
  sortBy: z.enum(["createdAt", "fileName", "fileSize"]).default("createdAt").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

/**
 * Schema for bulk delete operation
 */
export const bulkDeleteAttachmentsSchema = z.object({
  attachmentIds: z.array(z.string().uuid()).min(1, "At least one attachment ID is required"),
});

/**
 * Schema for storage quota check
 */
export const storageQuotaSchema = z.object({
  usedBytes: z.number().int().min(0),
  quotaBytes: z.number().int().min(0),
  availableBytes: z.number().int().min(0),
  usagePercentage: z.number().min(0).max(100),
});

/**
 * Inferred TypeScript types
 */
export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>;
export type AttachmentUploadResponse = z.infer<typeof attachmentUploadResponseSchema>;
export type UpdateAttachmentInput = z.infer<typeof updateAttachmentSchema>;
export type AttachmentFilterInput = z.infer<typeof attachmentFilterSchema>;
export type BulkDeleteAttachmentsInput = z.infer<typeof bulkDeleteAttachmentsSchema>;
export type StorageQuota = z.infer<typeof storageQuotaSchema>;
export type AttachmentEntityType = z.infer<typeof attachmentEntityTypeSchema>;

/**
 * Helper: Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Helper: Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

/**
 * Helper: Validate file on client before upload
 */
export function validateFileForUpload(file: File): {
  valid: boolean;
  error?: string;
  data?: CreateAttachmentInput;
} {
  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${formatBytes(maxSize)}`,
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type as never)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed`,
    };
  }

  return {
    valid: true,
    data: {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      entityType: "note", // Will be set by caller
      entityId: "", // Will be set by caller
      metadata: {},
    },
  };
}
