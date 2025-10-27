"use server";

import { db } from "@/db";
import { note } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { syncAssignedToLink } from "@/features/links/helpers";
import {
  createNoteSchema,
  updateNoteSchema,
  bulkNoteOperationSchema,
  type UpdateNoteInput,
} from "./schema";
import {
  validateSession,
  checkOwnership,
  revalidateEntityPaths,
  revalidateProjectChange,
  handleEntityError,
  copyEntityTags,
  softDeleteEntity,
  hardDeleteEntity,
  restoreEntityFromTrash,
  archiveEntity,
  restoreArchivedEntity,
} from "@/lib/entity-helpers";

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new note
 *
 * @param input - Note data conforming to CreateNoteInput
 * @returns Created note object with id
 * @throws Error if user is not authenticated or validation fails
 */
export async function createNote(input: unknown) {
  const session = await validateSession("create a note");

  // Validate input
  const data = createNoteSchema.parse(input);

  try {
    // Create note
    const [createdNote] = await db
      .insert(note)
      .values({
        ...data,
        userId: session.user.id,
        // type and isFavorite use database defaults
      })
      .returning();

    // Sync assigned_to link if projectId is provided
    if (data.projectId) {
      await syncAssignedToLink(session.user.id, "note", createdNote.id, data.projectId);
    }

    // Revalidate paths
    revalidateEntityPaths("note", undefined, data.projectId);

    return { success: true, note: createdNote };
  } catch (error) {
    handleEntityError(error, "creating", "note");
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update an existing note
 *
 * @param id - Note UUID
 * @param input - Partial note data to update
 * @returns Updated note object
 * @throws Error if user is not authenticated, note not found, or not authorized
 */
export async function updateNote(id: string, input: unknown) {
  const session = await validateSession("update a note");

  // Validate input
  const data = updateNoteSchema.parse(input);

  try {
    // Verify ownership
    const existingNote = await checkOwnership<typeof note.$inferSelect>(
      "note",
      id,
      session.user.id
    );

    const updates: UpdateNoteInput = { ...data };

    // Update note
    const [updatedNote] = await db.update(note).set(updates).where(eq(note.id, id)).returning();

    // Sync assigned_to link if projectId changed
    if ("projectId" in data) {
      await syncAssignedToLink(session.user.id, "note", id, data.projectId);
    }

    // Revalidate paths
    revalidateEntityPaths("note", id, existingNote.projectId);
    revalidateProjectChange("note", existingNote.projectId, data.projectId);

    return { success: true, note: updatedNote };
  } catch (error) {
    handleEntityError(error, "updating", "note");
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Soft delete a note (move to trash)
 *
 * Sets deleted_at timestamp. Note can be restored within 30 days.
 *
 * @param id - Note UUID
 * @returns Success status
 * @throws Error if user is not authenticated, note not found, or not authorized
 */
export async function deleteNote(id: string) {
  const session = await validateSession("delete a note");

  try {
    return await softDeleteEntity("note", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "deleting", "note");
  }
}

/**
 * Permanently delete a note (hard delete from trash)
 *
 * This action cannot be undone.
 *
 * @param id - Note UUID
 * @returns Success response
 */
export async function hardDeleteNote(id: string) {
  const session = await validateSession("permanently delete a note");

  try {
    return await hardDeleteEntity("note", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "permanently deleting", "note");
  }
}

/**
 * Restore a note from trash
 *
 * @param id - Note UUID
 * @returns Success response
 */
export async function restoreFromTrashNote(id: string) {
  const session = await validateSession("restore a note from trash");

  try {
    return await restoreEntityFromTrash("note", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "restoring", "note");
  }
}

/**
 * Duplicate a note
 *
 * Creates a copy of an existing note with:
 * - Title prefixed with "Copy of"
 * - Same content, type, project assignment
 * - Favorite status reset to false
 * - Parent relationship cleared
 * - Tags copied
 * - Comments, links, and attachments NOT copied
 *
 * @param id - Note UUID to duplicate
 * @returns Newly created note object
 * @throws Error if user is not authenticated, note not found, or not authorized
 */
export async function duplicateNote(id: string) {
  const session = await validateSession("duplicate a note");

  try {
    // Verify ownership
    const originalNote = await checkOwnership<typeof note.$inferSelect>(
      "note",
      id,
      session.user.id
    );

    // Create duplicated note
    const [duplicatedNote] = await db
      .insert(note)
      .values({
        userId: session.user.id,
        title: originalNote.title ? `Copy of ${originalNote.title}` : "Copy of note",
        content: originalNote.content,
        type: originalNote.type,
        projectId: originalNote.projectId,
        parentNoteId: null, // Don't copy parent relationship
        isFavorite: false, // Reset favorite status
        metadata: originalNote.metadata,
      })
      .returning();

    // Copy tags
    await copyEntityTags("note", id, "note", duplicatedNote.id, session.user.id);

    // Sync assigned_to link if projectId exists
    if (duplicatedNote.projectId) {
      await syncAssignedToLink(
        session.user.id,
        "note",
        duplicatedNote.id,
        duplicatedNote.projectId
      );
    }

    // Revalidate paths
    revalidateEntityPaths("note", undefined, duplicatedNote.projectId);

    return { success: true, note: duplicatedNote };
  } catch (error) {
    handleEntityError(error, "duplicating", "note");
  }
}

// ============================================================================
// ARCHIVE OPERATIONS
// ============================================================================

export async function archiveNote(id: string) {
  const session = await validateSession("archive a note");

  try {
    return await archiveEntity("note", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "archiving", "note");
  }
}

export async function restoreNote(id: string) {
  const session = await validateSession("restore a note from archive");

  try {
    return await restoreArchivedEntity("note", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "restoring", "note");
  }
}

// ============================================================================
// FAVORITE OPERATIONS
// ============================================================================

/**
 * Toggle note favorite status
 *
 * @param id - Note UUID
 * @param isFavorite - New favorite status
 * @returns Updated note
 * @throws Error if user is not authenticated or note not found
 */
export async function toggleNoteFavorite(id: string, isFavorite: boolean) {
  const session = await validateSession("favorite a note");

  try {
    // Verify ownership
    await checkOwnership("note", id, session.user.id);

    const [updatedNote] = await db
      .update(note)
      .set({ isFavorite })
      .where(eq(note.id, id))
      .returning();

    revalidateEntityPaths("note", id);

    return { success: true, note: updatedNote };
  } catch (error) {
    handleEntityError(error, "toggling favorite for", "note");
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Perform bulk operations on multiple notes
 *
 * Supported operations:
 * - delete: Delete all notes
 * - favorite: Mark all as favorite
 * - unfavorite: Mark all as not favorite
 * - updateType: Change note type
 * - moveToProject: Move to project
 *
 * @param input - Bulk operation data
 * @returns Success status with count
 * @throws Error if user is not authenticated or validation fails
 */
export async function bulkNoteOperation(input: unknown) {
  const session = await validateSession("perform bulk operations");

  // Validate input
  const data = bulkNoteOperationSchema.parse(input);

  try {
    // Verify ownership of all notes
    const notes = await db.query.note.findMany({
      where: and(inArray(note.id, data.noteIds), eq(note.userId, session.user.id)),
    });

    if (notes.length !== data.noteIds.length) {
      throw new Error("Some notes not found or you don't have permission");
    }

    switch (data.operation) {
      case "delete":
        await db.delete(note).where(inArray(note.id, data.noteIds));
        break;

      case "favorite":
        await db.update(note).set({ isFavorite: true }).where(inArray(note.id, data.noteIds));
        break;

      case "unfavorite":
        await db.update(note).set({ isFavorite: false }).where(inArray(note.id, data.noteIds));
        break;

      case "updateType":
        if (!data.type) {
          throw new Error("Type is required for updateType operation");
        }
        await db.update(note).set({ type: data.type }).where(inArray(note.id, data.noteIds));
        break;

      case "moveToProject":
        await db
          .update(note)
          .set({ projectId: data.projectId })
          .where(inArray(note.id, data.noteIds));
        break;

      default:
        throw new Error("Invalid operation");
    }

    // Revalidate paths
    revalidateEntityPaths("note");
    const projectIds = [...new Set(notes.map((n) => n.projectId).filter(Boolean))];
    projectIds.forEach((projectId) => {
      if (projectId) revalidateEntityPaths("project", projectId);
    });

    if (data.projectId) {
      revalidateEntityPaths("project", data.projectId);
    }

    return { success: true, count: data.noteIds.length };
  } catch (error) {
    handleEntityError(error, "performing bulk operation on", "note");
  }
}
