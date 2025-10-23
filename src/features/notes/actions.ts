"use server";

import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { note } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { syncAssignedToLink } from "@/features/links/helpers";
import {
  createNoteSchema,
  updateNoteSchema,
  bulkNoteOperationSchema,
  type UpdateNoteInput,
} from "./schema";

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
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to create a note");
  }

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

    // Revalidate notes page
    revalidatePath("/dashboard/notes");
    if (data.projectId) {
      revalidatePath(`/dashboard/projects/${data.projectId}`);
    }

    return { success: true, note: createdNote };
  } catch (error) {
    console.error("Error creating note:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create note");
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
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to update a note");
  }

  // Validate input
  const data = updateNoteSchema.parse(input);

  try {
    // Verify ownership
    const existingNote = await db.query.note.findFirst({
      where: and(eq(note.id, id), eq(note.userId, session.user.id)),
    });

    if (!existingNote) {
      throw new Error("Note not found or you don't have permission to update it");
    }

    const updates: UpdateNoteInput = { ...data };

    // Update note
    const [updatedNote] = await db.update(note).set(updates).where(eq(note.id, id)).returning();

    // Sync assigned_to link if projectId changed
    if ("projectId" in data) {
      await syncAssignedToLink(session.user.id, "note", id, data.projectId);
    }

    // Revalidate relevant pages
    revalidatePath("/dashboard/notes");
    revalidatePath(`/dashboard/notes/${id}`);
    if (existingNote.projectId) {
      revalidatePath(`/dashboard/projects/${existingNote.projectId}`);
    }
    if (data.projectId && data.projectId !== existingNote.projectId) {
      revalidatePath(`/dashboard/projects/${data.projectId}`);
    }

    return { success: true, note: updatedNote };
  } catch (error) {
    console.error("Error updating note:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update note");
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a note
 *
 * @param id - Note UUID
 * @returns Success status
 * @throws Error if user is not authenticated, note not found, or not authorized
 */
export async function deleteNote(id: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to delete a note");
  }

  try {
    // Verify ownership before deleting
    const existingNote = await db.query.note.findFirst({
      where: and(eq(note.id, id), eq(note.userId, session.user.id)),
    });

    if (!existingNote) {
      throw new Error("Note not found or you don't have permission to delete it");
    }

    await db.delete(note).where(eq(note.id, id));

    // Revalidate relevant pages
    revalidatePath("/dashboard/notes");
    if (existingNote.projectId) {
      revalidatePath(`/dashboard/projects/${existingNote.projectId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting note:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete note");
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
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to favorite a note");
  }

  try {
    // Verify ownership
    const existingNote = await db.query.note.findFirst({
      where: and(eq(note.id, id), eq(note.userId, session.user.id)),
    });

    if (!existingNote) {
      throw new Error("Note not found or you don't have permission to update it");
    }

    const [updatedNote] = await db
      .update(note)
      .set({ isFavorite })
      .where(eq(note.id, id))
      .returning();

    revalidatePath("/dashboard/notes");
    revalidatePath(`/dashboard/notes/${id}`);

    return { success: true, note: updatedNote };
  } catch (error) {
    console.error("Error toggling note favorite:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to toggle note favorite");
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
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to perform bulk operations");
  }

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

    // Revalidate notes page
    revalidatePath("/dashboard/notes");

    // Revalidate project pages if affected
    const projectIds = [...new Set(notes.map((n) => n.projectId).filter(Boolean))];
    projectIds.forEach((projectId) => {
      if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
    });

    if (data.projectId) {
      revalidatePath(`/dashboard/projects/${data.projectId}`);
    }

    return { success: true, count: data.noteIds.length };
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to perform bulk operation");
  }
}
