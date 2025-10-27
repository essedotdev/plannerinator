import { db } from "@/db";
import { task, event, note, project } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { getSession } from "@/lib/auth";

/**
 * Trash Queries
 *
 * Get deleted items across all entity types
 */

export type TrashItem = {
  id: string;
  type: "task" | "event" | "note" | "project";
  title: string;
  deletedAt: Date;
};

/**
 * Get all deleted items for the current user
 *
 * @returns Array of deleted items sorted by deletion date
 * @throws Error if user is not authenticated
 */
export async function getTrashItems() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view trash");
  }

  try {
    // Get deleted tasks
    const deletedTasks = await db
      .select({
        id: task.id,
        title: task.title,
        deletedAt: task.deletedAt,
      })
      .from(task)
      .where(and(eq(task.userId, session.user.id), isNotNull(task.deletedAt)));

    // Get deleted events
    const deletedEvents = await db
      .select({
        id: event.id,
        title: event.title,
        deletedAt: event.deletedAt,
      })
      .from(event)
      .where(and(eq(event.userId, session.user.id), isNotNull(event.deletedAt)));

    // Get deleted notes
    const deletedNotes = await db
      .select({
        id: note.id,
        title: note.title,
        deletedAt: note.deletedAt,
      })
      .from(note)
      .where(and(eq(note.userId, session.user.id), isNotNull(note.deletedAt)));

    // Get deleted projects
    const deletedProjects = await db
      .select({
        id: project.id,
        name: project.name,
        deletedAt: project.deletedAt,
      })
      .from(project)
      .where(and(eq(project.userId, session.user.id), isNotNull(project.deletedAt)));

    // Combine all deleted items
    const trashItems: TrashItem[] = [
      ...deletedTasks.map((t) => ({
        id: t.id,
        type: "task" as const,
        title: t.title,
        deletedAt: t.deletedAt!,
      })),
      ...deletedEvents.map((e) => ({
        id: e.id,
        type: "event" as const,
        title: e.title,
        deletedAt: e.deletedAt!,
      })),
      ...deletedNotes.map((n) => ({
        id: n.id,
        type: "note" as const,
        title: n.title || "Untitled Note",
        deletedAt: n.deletedAt!,
      })),
      ...deletedProjects.map((p) => ({
        id: p.id,
        type: "project" as const,
        title: p.name,
        deletedAt: p.deletedAt!,
      })),
    ];

    // Sort by deletion date (most recent first)
    trashItems.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());

    return trashItems;
  } catch (error) {
    console.error("Error fetching trash items:", error);
    throw new Error("Failed to fetch trash items");
  }
}
