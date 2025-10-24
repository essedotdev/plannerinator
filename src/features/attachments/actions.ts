"use server";

import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { attachment, user } from "@/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  createAttachmentSchema,
  updateAttachmentSchema,
  bulkDeleteAttachmentsSchema,
  type CreateAttachmentInput,
  type UpdateAttachmentInput,
} from "./schema";
import { getUserStorageQuota } from "./queries";
import { r2 } from "@/lib/r2-client";

// ============================================================================
// UPLOAD OPERATIONS
// ============================================================================

/**
 * Generate a presigned URL for direct upload to R2
 *
 * This allows client-side upload directly to R2, bypassing server bandwidth.
 * After upload completes, client calls `confirmAttachmentUpload` to save metadata.
 *
 * @param input - File metadata
 * @returns Presigned upload URL and storage key
 * @throws Error if user is not authenticated or quota exceeded
 */
export async function generateUploadUrl(input: unknown) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to upload files");
  }

  // Validate input
  const data = createAttachmentSchema.parse(input);

  try {
    // Check storage quota
    const quota = await getUserStorageQuota();
    if (quota.availableBytes < data.fileSize) {
      throw new Error(
        `Storage quota exceeded. You have ${(quota.availableBytes / 1024 / 1024).toFixed(2)}MB available, but need ${(data.fileSize / 1024 / 1024).toFixed(2)}MB`
      );
    }

    // Generate unique storage key
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sanitizedFileName = data.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storageKey = `${session.user.id}/${data.entityType}/${data.entityId}/${timestamp}-${randomString}-${sanitizedFileName}`;

    // Generate presigned URL (valid for 15 minutes)
    const uploadUrl = await r2.getUploadUrl({
      Key: storageKey,
      ContentType: data.mimeType,
    });

    return {
      success: true,
      uploadUrl,
      storageKey,
    };
  } catch (error) {
    console.error("Error generating upload URL:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate upload URL");
  }
}

/**
 * Confirm attachment upload and save metadata to database
 *
 * Called after client successfully uploads file to R2 using presigned URL.
 *
 * @param input - File metadata with storageKey from generateUploadUrl
 * @returns Created attachment record
 * @throws Error if user is not authenticated or validation fails
 */
export async function confirmAttachmentUpload(
  input: CreateAttachmentInput & { storageKey: string }
) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to upload files");
  }

  // Validate input
  const data = createAttachmentSchema.parse(input);

  try {
    // Verify storage key belongs to this user
    if (!input.storageKey.startsWith(session.user.id)) {
      throw new Error("Invalid storage key");
    }

    // Create attachment record
    const [createdAttachment] = await db
      .insert(attachment)
      .values({
        userId: session.user.id,
        entityType: data.entityType,
        entityId: data.entityId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        storageKey: input.storageKey,
        storageUrl: null, // Using private bucket with signed URLs
        metadata: data.metadata || {},
      })
      .returning();

    // Update user storage used
    await db
      .update(user)
      .set({
        storageUsedBytes: sql`${user.storageUsedBytes} + ${data.fileSize}`,
      })
      .where(eq(user.id, session.user.id));

    // Revalidate relevant pages
    revalidatePath(`/dashboard/${data.entityType}s`);
    revalidatePath(`/dashboard/${data.entityType}s/${data.entityId}`);

    return { success: true, attachment: createdAttachment };
  } catch (error) {
    console.error("Error confirming attachment upload:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to confirm attachment upload");
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete an attachment
 *
 * Removes file from R2 and database record.
 *
 * @param id - Attachment UUID
 * @returns Success status
 * @throws Error if user is not authenticated, attachment not found, or not authorized
 */
export async function deleteAttachment(id: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to delete attachments");
  }

  try {
    // Verify ownership
    const existingAttachment = await db.query.attachment.findFirst({
      where: and(eq(attachment.id, id), eq(attachment.userId, session.user.id)),
    });

    if (!existingAttachment) {
      throw new Error("Attachment not found or you don't have permission to delete it");
    }

    // Delete from R2
    try {
      await r2.deleteObject({
        Key: existingAttachment.storageKey,
      });
    } catch (r2Error) {
      console.error("Error deleting from R2:", r2Error);
      // Continue with database deletion even if R2 deletion fails
    }

    // Delete from database
    await db.delete(attachment).where(eq(attachment.id, id));

    // Update user storage used
    await db
      .update(user)
      .set({
        storageUsedBytes: sql`GREATEST(0, ${user.storageUsedBytes} - ${existingAttachment.fileSize})`,
      })
      .where(eq(user.id, session.user.id));

    // Revalidate relevant pages
    revalidatePath(`/dashboard/${existingAttachment.entityType}s`);
    revalidatePath(`/dashboard/${existingAttachment.entityType}s/${existingAttachment.entityId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting attachment:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete attachment");
  }
}

/**
 * Bulk delete attachments
 *
 * @param input - Array of attachment IDs to delete
 * @returns Success status with count
 * @throws Error if user is not authenticated or validation fails
 */
export async function bulkDeleteAttachments(input: unknown) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to delete attachments");
  }

  // Validate input
  const data = bulkDeleteAttachmentsSchema.parse(input);

  try {
    // Verify ownership of all attachments
    const attachments = await db.query.attachment.findMany({
      where: and(
        inArray(attachment.id, data.attachmentIds),
        eq(attachment.userId, session.user.id)
      ),
    });

    if (attachments.length !== data.attachmentIds.length) {
      throw new Error("Some attachments not found or you don't have permission");
    }

    // Delete from R2
    const deletePromises = attachments.map((att) =>
      r2
        .deleteObject({
          Key: att.storageKey,
        })
        .catch((error) => {
          console.error(`Error deleting ${att.storageKey} from R2:`, error);
          // Continue even if R2 deletion fails
        })
    );
    await Promise.all(deletePromises);

    // Delete from database
    await db.delete(attachment).where(inArray(attachment.id, data.attachmentIds));

    // Calculate total size deleted
    const totalSize = attachments.reduce((sum, att) => sum + att.fileSize, 0);

    // Update user storage used
    await db
      .update(user)
      .set({
        storageUsedBytes: sql`GREATEST(0, ${user.storageUsedBytes} - ${totalSize})`,
      })
      .where(eq(user.id, session.user.id));

    // Revalidate relevant pages
    const entityTypes = new Set(attachments.map((att) => att.entityType));
    entityTypes.forEach((entityType) => {
      revalidatePath(`/dashboard/${entityType}s`);
    });

    return { success: true, count: attachments.length };
  } catch (error) {
    console.error("Error bulk deleting attachments:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to bulk delete attachments");
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update an attachment's metadata
 *
 * Only fileName and metadata can be updated.
 * File content is immutable - delete and re-upload to change file.
 *
 * @param id - Attachment UUID
 * @param input - Updated fields
 * @returns Updated attachment
 * @throws Error if user is not authenticated or not authorized
 */
export async function updateAttachment(id: string, input: unknown) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to update attachments");
  }

  // Validate input
  const data = updateAttachmentSchema.parse(input);

  try {
    // Verify ownership
    const existingAttachment = await db.query.attachment.findFirst({
      where: and(eq(attachment.id, id), eq(attachment.userId, session.user.id)),
    });

    if (!existingAttachment) {
      throw new Error("Attachment not found or you don't have permission to update it");
    }

    // Update attachment
    const updates: UpdateAttachmentInput = { ...data };
    const [updatedAttachment] = await db
      .update(attachment)
      .set(updates)
      .where(eq(attachment.id, id))
      .returning();

    // Revalidate relevant pages
    revalidatePath(`/dashboard/${existingAttachment.entityType}s`);
    revalidatePath(`/dashboard/${existingAttachment.entityType}s/${existingAttachment.entityId}`);

    return { success: true, attachment: updatedAttachment };
  } catch (error) {
    console.error("Error updating attachment:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update attachment");
  }
}

// ============================================================================
// DOWNLOAD OPERATIONS
// ============================================================================

/**
 * Generate a signed URL for downloading an attachment
 *
 * URL expires after 1 hour for security.
 *
 * @param id - Attachment UUID
 * @returns Signed download URL
 * @throws Error if user is not authenticated or not authorized
 */
export async function getAttachmentDownloadUrl(id: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to download attachments");
  }

  try {
    // Verify ownership
    const existingAttachment = await db.query.attachment.findFirst({
      where: and(eq(attachment.id, id), eq(attachment.userId, session.user.id)),
    });

    if (!existingAttachment) {
      throw new Error("Attachment not found or you don't have permission to access it");
    }

    // Generate signed URL (valid for 1 hour)
    const downloadUrl = await r2.getDownloadUrl({
      Key: existingAttachment.storageKey,
      ResponseContentDisposition: `attachment; filename="${existingAttachment.fileName}"`,
    });

    return { success: true, downloadUrl };
  } catch (error) {
    console.error("Error generating download URL:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate download URL");
  }
}
