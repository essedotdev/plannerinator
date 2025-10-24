import { db } from "@/db";
import { attachment, user } from "@/db/schema";
import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import {
  attachmentFilterSchema,
  type AttachmentFilterInput,
  type StorageQuota,
  FILE_TYPE_CATEGORIES,
} from "./schema";

// ============================================================================
// SINGLE ATTACHMENT QUERIES
// ============================================================================

/**
 * Get a single attachment by ID
 *
 * @param id - Attachment UUID
 * @returns Attachment or null if not found
 * @throws Error if user is not authenticated or not authorized
 */
export async function getAttachmentById(id: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view attachments");
  }

  try {
    const [attachmentData] = await db
      .select()
      .from(attachment)
      .where(and(eq(attachment.id, id), eq(attachment.userId, session.user.id)))
      .limit(1);

    return attachmentData || null;
  } catch (error) {
    console.error("Error fetching attachment:", error);
    throw new Error("Failed to fetch attachment");
  }
}

// ============================================================================
// ATTACHMENT LIST QUERIES
// ============================================================================

/**
 * Get attachments with optional filters, sorting, and pagination
 *
 * Filters:
 * - entityType: Filter by entity type (task, event, note, etc.)
 * - entityId: Filter by specific entity
 * - mimeType: Filter by MIME type
 * - category: Filter by file category (image, document, etc.)
 *
 * Sorting:
 * - sortBy: createdAt, fileName, fileSize
 * - sortOrder: asc or desc
 *
 * Pagination:
 * - limit: Max number of results (default 50)
 * - offset: Number of results to skip (default 0)
 *
 * @param filters - Attachment filter options
 * @returns Array of attachments with count
 * @throws Error if user is not authenticated
 */
export async function getAttachments(filters: AttachmentFilterInput = {}) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view attachments");
  }

  try {
    // Parse and validate filters
    const validatedFilters = attachmentFilterSchema.parse(filters);

    const {
      entityType,
      entityId,
      mimeType,
      category,
      limit = 50,
      offset = 0,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = validatedFilters;

    // Build WHERE conditions
    const conditions = [eq(attachment.userId, session.user.id)];

    if (entityType) {
      conditions.push(eq(attachment.entityType, entityType));
    }

    if (entityId) {
      conditions.push(eq(attachment.entityId, entityId));
    }

    if (mimeType) {
      conditions.push(eq(attachment.mimeType, mimeType));
    }

    if (category) {
      const categoryTypes = FILE_TYPE_CATEGORIES[category];
      if (categoryTypes) {
        conditions.push(inArray(attachment.mimeType, categoryTypes as unknown as string[]));
      }
    }

    // Build ORDER BY clause
    const orderByColumn = {
      createdAt: attachment.createdAt,
      fileName: attachment.fileName,
      fileSize: attachment.fileSize,
    }[sortBy];

    const orderByFn = sortOrder === "asc" ? asc : desc;

    // Execute query
    const attachments = await db
      .select()
      .from(attachment)
      .where(and(...conditions))
      .orderBy(orderByFn(orderByColumn))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(attachment)
      .where(and(...conditions));

    const total = countResult?.count ?? 0;

    return {
      attachments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  } catch (error) {
    console.error("Error fetching attachments:", error);
    throw new Error("Failed to fetch attachments");
  }
}

/**
 * Get attachments for a specific entity
 *
 * @param entityType - Entity type (task, event, note, project, collection_item)
 * @param entityId - Entity UUID
 * @returns Array of attachments sorted by creation date
 * @throws Error if user is not authenticated
 */
export async function getAttachmentsByEntity(
  entityType: string,
  entityId: string
): Promise<(typeof attachment.$inferSelect)[]> {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view attachments");
  }

  try {
    const attachments = await db
      .select()
      .from(attachment)
      .where(
        and(
          eq(attachment.userId, session.user.id),
          eq(attachment.entityType, entityType as never),
          eq(attachment.entityId, entityId)
        )
      )
      .orderBy(desc(attachment.createdAt));

    return attachments;
  } catch (error) {
    console.error("Error fetching attachments by entity:", error);
    throw new Error("Failed to fetch attachments");
  }
}

/**
 * Get attachment count for a specific entity
 *
 * @param entityType - Entity type
 * @param entityId - Entity UUID
 * @returns Number of attachments
 * @throws Error if user is not authenticated
 */
export async function getAttachmentCount(entityType: string, entityId: string): Promise<number> {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view attachments");
  }

  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(attachment)
      .where(
        and(
          eq(attachment.userId, session.user.id),
          eq(attachment.entityType, entityType as never),
          eq(attachment.entityId, entityId)
        )
      );

    return result?.count ?? 0;
  } catch (error) {
    console.error("Error counting attachments:", error);
    throw new Error("Failed to count attachments");
  }
}

// ============================================================================
// STORAGE QUOTA QUERIES
// ============================================================================

/**
 * Get current user's storage quota and usage
 *
 * @returns Storage quota information
 * @throws Error if user is not authenticated
 */
export async function getUserStorageQuota(): Promise<StorageQuota> {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view storage quota");
  }

  try {
    const [userData] = await db
      .select({
        usedBytes: user.storageUsedBytes,
        quotaBytes: user.storageQuotaBytes,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!userData) {
      throw new Error("User not found");
    }

    const usedBytes = Number(userData.usedBytes);
    const quotaBytes = Number(userData.quotaBytes);
    const availableBytes = Math.max(0, quotaBytes - usedBytes);
    const usagePercentage = quotaBytes > 0 ? (usedBytes / quotaBytes) * 100 : 0;

    return {
      usedBytes,
      quotaBytes,
      availableBytes,
      usagePercentage: Math.round(usagePercentage * 100) / 100, // Round to 2 decimals
    };
  } catch (error) {
    console.error("Error fetching storage quota:", error);
    throw new Error("Failed to fetch storage quota");
  }
}

/**
 * Check if user has enough storage space for a new file
 *
 * @param fileSize - Size of file to upload in bytes
 * @returns True if user has enough space
 * @throws Error if user is not authenticated
 */
export async function hasStorageSpace(fileSize: number): Promise<boolean> {
  const quota = await getUserStorageQuota();
  return quota.availableBytes >= fileSize;
}

/**
 * Get total storage used by current user
 *
 * Recalculates from actual attachments (use for verification/sync)
 *
 * @returns Total bytes used
 * @throws Error if user is not authenticated
 */
export async function calculateStorageUsed(): Promise<number> {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in");
  }

  try {
    const [result] = await db
      .select({ total: sql<number>`COALESCE(SUM(${attachment.fileSize}), 0)::int` })
      .from(attachment)
      .where(eq(attachment.userId, session.user.id));

    return result?.total ?? 0;
  } catch (error) {
    console.error("Error calculating storage used:", error);
    throw new Error("Failed to calculate storage usage");
  }
}
