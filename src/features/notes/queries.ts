import { db } from "@/db";
import { note, project, link, entityTag } from "@/db/schema";
import { eq, and, desc, asc, or, ilike, isNull, isNotNull, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { noteFilterSchema, type NoteFilterInput } from "./schema";

// ============================================================================
// SINGLE NOTE QUERIES
// ============================================================================

/**
 * Get a single note by ID with relations
 *
 * Relations included:
 * - Project (if assigned)
 * - Child notes (if this is a parent)
 * - Parent note (if this is nested)
 *
 * Future relations (not yet implemented):
 * - Tags
 * - Comments
 * - Links to other entities
 *
 * @param id - Note UUID
 * @returns Note with relations or null if not found
 * @throws Error if user is not authenticated
 */
export async function getNoteById(id: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view notes");
  }

  try {
    // Get note with project relation
    const [noteData] = await db
      .select({
        note: note,
        project: project,
      })
      .from(note)
      .leftJoin(
        link,
        and(
          eq(link.fromType, "note"),
          eq(link.fromId, note.id),
          eq(link.relationship, "assigned_to"),
          eq(link.toType, "project")
        )
      )
      .leftJoin(project, eq(link.toId, project.id))
      .where(and(eq(note.id, id), eq(note.userId, session.user.id)))
      .limit(1);

    if (!noteData) {
      return null;
    }

    // Get child notes
    const childNotes = await db
      .select()
      .from(note)
      .where(and(eq(note.parentNoteId, id), eq(note.userId, session.user.id)))
      .orderBy(desc(note.updatedAt));

    // Get parent note if exists
    let parentNote = null;
    if (noteData.note.parentNoteId) {
      const [parent] = await db
        .select()
        .from(note)
        .where(eq(note.id, noteData.note.parentNoteId))
        .limit(1);
      parentNote = parent || null;
    }

    return {
      ...noteData.note,
      project: noteData.project || null,
      childNotes,
      parentNote,
    };
  } catch (error) {
    console.error("Error fetching note:", error);
    throw new Error("Failed to fetch note");
  }
}

// ============================================================================
// NOTE LIST QUERIES
// ============================================================================

/**
 * Get notes with optional filters, sorting, and pagination
 *
 * Filters:
 * - type: Filter by note type (note, document, research, idea, snippet)
 * - projectId: Filter by project
 * - parentNoteId: Get child notes of a specific note (or null for root notes)
 * - isFavorite: Filter by favorite status
 * - search: Full-text search in title and content
 *
 * Sorting:
 * - sortBy: createdAt, updatedAt, title
 * - sortOrder: asc or desc
 *
 * Pagination:
 * - limit: Max number of results (default 50)
 * - offset: Number of results to skip (default 0)
 *
 * @param filters - Note filter options
 * @returns Array of notes with count
 * @throws Error if user is not authenticated
 */
export async function getNotes(filters: NoteFilterInput = {}) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view notes");
  }

  try {
    // Parse and validate filters
    const validatedFilters = noteFilterSchema.parse(filters);

    const {
      type,
      projectId,
      parentNoteId,
      isFavorite,
      search,
      limit = 50,
      offset = 0,
      sortBy = "updatedAt",
      sortOrder = "desc",
    } = validatedFilters;

    // Build WHERE conditions
    const conditions = [eq(note.userId, session.user.id)];

    // Handle view filter (active/archived/all)
    const view = validatedFilters.view ?? "active";
    switch (view) {
      case "active":
        conditions.push(isNull(note.deletedAt));
        conditions.push(isNull(note.archivedAt));
        break;
      case "archived":
        conditions.push(isNull(note.deletedAt));
        conditions.push(isNotNull(note.archivedAt));
        break;
      case "all":
        conditions.push(isNull(note.deletedAt)); // Always exclude deleted
        // No filter on archivedAt - show both active and archived
        break;
    }

    if (type) {
      conditions.push(eq(note.type, type));
    }

    if (projectId) {
      conditions.push(eq(note.projectId, projectId));
    }

    if (parentNoteId !== undefined) {
      if (parentNoteId === null) {
        conditions.push(isNull(note.parentNoteId));
      } else {
        conditions.push(eq(note.parentNoteId, parentNoteId));
      }
    }

    if (isFavorite !== undefined) {
      conditions.push(eq(note.isFavorite, isFavorite));
    }

    if (search) {
      conditions.push(or(ilike(note.title, `%${search}%`), ilike(note.content, `%${search}%`))!);
    }

    // Tag filtering
    // If tagIds are provided, filter notes that have the specified tags
    // - OR logic: note has at least one of the tags
    // - AND logic: note has all of the tags
    if (validatedFilters.tagIds && validatedFilters.tagIds.length > 0) {
      const tagLogic = validatedFilters.tagLogic || "OR";

      if (tagLogic === "OR") {
        // OR logic: note has at least one of the tags
        conditions.push(
          sql`EXISTS (
            SELECT 1 FROM ${entityTag}
            WHERE ${entityTag.entityType} = 'note'
            AND ${entityTag.entityId} = ${note.id}
            AND ${entityTag.tagId} = ANY(${sql`ARRAY[${sql.join(
              validatedFilters.tagIds.map((id) => sql`${id}::uuid`),
              sql`, `
            )}]`})
          )`
        );
      } else {
        // AND logic: note has all of the tags
        conditions.push(
          sql`EXISTS (
            SELECT 1 FROM ${entityTag}
            WHERE ${entityTag.entityType} = 'note'
            AND ${entityTag.entityId} = ${note.id}
            AND ${entityTag.tagId} = ANY(${sql`ARRAY[${sql.join(
              validatedFilters.tagIds.map((id) => sql`${id}::uuid`),
              sql`, `
            )}]`})
            GROUP BY ${entityTag.entityId}
            HAVING COUNT(DISTINCT ${entityTag.tagId}) = ${validatedFilters.tagIds.length}
          )`
        );
      }
    }

    // Build ORDER BY clause
    const orderByColumn = {
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      title: note.title,
    }[sortBy];

    const orderByFn = sortOrder === "asc" ? asc : desc;

    // Execute query with project relation
    const notes = await db
      .select({
        note: note,
        project: project,
      })
      .from(note)
      .leftJoin(
        link,
        and(
          eq(link.fromType, "note"),
          eq(link.fromId, note.id),
          eq(link.relationship, "assigned_to"),
          eq(link.toType, "project")
        )
      )
      .leftJoin(project, eq(link.toId, project.id))
      .where(and(...conditions))
      .orderBy(orderByFn(orderByColumn))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(note)
      .where(and(...conditions));

    const total = countResult?.count ?? 0;

    return {
      notes: notes.map((row) => ({
        ...row.note,
        project: row.project || null,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw new Error("Failed to fetch notes");
  }
}

// ============================================================================
// SPECIALIZED QUERIES
// ============================================================================

/**
 * Get favorite notes
 *
 * @param limit - Maximum number of results (default 20)
 * @returns Favorite notes sorted by most recently updated
 * @throws Error if user is not authenticated
 */
export async function getFavoriteNotes(limit = 20) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view notes");
  }

  try {
    const notes = await db
      .select({
        note: note,
        project: project,
      })
      .from(note)
      .leftJoin(
        link,
        and(
          eq(link.fromType, "note"),
          eq(link.fromId, note.id),
          eq(link.relationship, "assigned_to"),
          eq(link.toType, "project")
        )
      )
      .leftJoin(project, eq(link.toId, project.id))
      .where(
        and(
          eq(note.userId, session.user.id),
          eq(note.isFavorite, true),
          isNull(note.deletedAt),
          isNull(note.archivedAt)
        )
      )
      .orderBy(desc(note.updatedAt))
      .limit(limit);

    return notes.map((row) => ({
      ...row.note,
      project: row.project || null,
    }));
  } catch (error) {
    console.error("Error fetching favorite notes:", error);
    throw new Error("Failed to fetch favorite notes");
  }
}

/**
 * Get recently updated notes
 *
 * @param limit - Maximum number of results (default 10)
 * @returns Recently updated notes
 * @throws Error if user is not authenticated
 */
export async function getRecentNotes(limit = 10) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view notes");
  }

  try {
    const notes = await db
      .select({
        note: note,
        project: project,
      })
      .from(note)
      .leftJoin(
        link,
        and(
          eq(link.fromType, "note"),
          eq(link.fromId, note.id),
          eq(link.relationship, "assigned_to"),
          eq(link.toType, "project")
        )
      )
      .leftJoin(project, eq(link.toId, project.id))
      .where(and(eq(note.userId, session.user.id), isNull(note.deletedAt), isNull(note.archivedAt)))
      .orderBy(desc(note.updatedAt))
      .limit(limit);

    return notes.map((row) => ({
      ...row.note,
      project: row.project || null,
    }));
  } catch (error) {
    console.error("Error fetching recent notes:", error);
    throw new Error("Failed to fetch recent notes");
  }
}

/**
 * Get notes by project ID
 *
 * @param projectId - Project UUID
 * @returns Notes assigned to the project, sorted by most recent
 * @throws Error if user is not authenticated
 */
export async function getNotesByProject(projectId: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view notes");
  }

  try {
    const notes = await db
      .select()
      .from(note)
      .where(
        and(
          eq(note.userId, session.user.id),
          eq(note.projectId, projectId),
          isNull(note.deletedAt),
          isNull(note.archivedAt)
        )
      )
      .orderBy(desc(note.updatedAt));

    return notes;
  } catch (error) {
    console.error("Error fetching notes by project:", error);
    throw new Error("Failed to fetch notes by project");
  }
}

/**
 * Get child notes of a parent note
 *
 * @param parentNoteId - Parent note UUID
 * @returns Child notes sorted by most recent
 * @throws Error if user is not authenticated
 */
export async function getChildNotes(parentNoteId: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view notes");
  }

  try {
    const notes = await db
      .select()
      .from(note)
      .where(
        and(
          eq(note.userId, session.user.id),
          eq(note.parentNoteId, parentNoteId),
          isNull(note.deletedAt),
          isNull(note.archivedAt)
        )
      )
      .orderBy(desc(note.updatedAt));

    return notes;
  } catch (error) {
    console.error("Error fetching child notes:", error);
    throw new Error("Failed to fetch child notes");
  }
}

/**
 * Search notes by query string
 *
 * Searches in: title, content
 *
 * @param query - Search query
 * @param limit - Maximum number of results (default 20)
 * @returns Matching notes
 * @throws Error if user is not authenticated
 */
export async function searchNotes(query: string, limit = 20) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to search notes");
  }

  if (!query.trim()) {
    return [];
  }

  try {
    const notes = await db
      .select({
        note: note,
        project: project,
      })
      .from(note)
      .leftJoin(
        link,
        and(
          eq(link.fromType, "note"),
          eq(link.fromId, note.id),
          eq(link.relationship, "assigned_to"),
          eq(link.toType, "project")
        )
      )
      .leftJoin(project, eq(link.toId, project.id))
      .where(
        and(
          eq(note.userId, session.user.id),
          isNull(note.deletedAt),
          isNull(note.archivedAt),
          or(ilike(note.title, `%${query}%`), ilike(note.content, `%${query}%`))!
        )
      )
      .orderBy(desc(note.updatedAt))
      .limit(limit);

    return notes.map((row) => ({
      ...row.note,
      project: row.project || null,
    }));
  } catch (error) {
    console.error("Error searching notes:", error);
    throw new Error("Failed to search notes");
  }
}
