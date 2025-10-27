"use server";

import { getNotes } from "./queries";

/**
 * Server action to get notes for parent selection
 * Used by client components (NoteForm)
 */
export async function getNotesForParentSelection(excludeId?: string) {
  try {
    const result = await getNotes({
      sortBy: "title",
      sortOrder: "asc",
      limit: 100,
    });

    // Filter out the current note if provided
    const filteredNotes = excludeId ? result.notes.filter((n) => n.id !== excludeId) : result.notes;

    return {
      success: true,
      notes: filteredNotes,
    };
  } catch (error) {
    console.error("Failed to load notes:", error);
    return {
      success: false,
      notes: [],
    };
  }
}
