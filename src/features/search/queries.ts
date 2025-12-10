"use server";

import { db } from "@/db";
import { event, note, project, task } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq, ilike, or, sql, isNull } from "drizzle-orm";
import { headers } from "next/headers";

// ===========================
// Types
// ===========================

export type SearchEntityType = "task" | "event" | "note" | "project";

export type SearchResult = {
  id: string;
  type: SearchEntityType;
  title: string;
  description?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  projectColor?: string | null;
  // Additional metadata for display
  status?: string | null;
  priority?: string | null;
  dueDate?: Date | null;
  startTime?: Date | null;
  noteType?: string | null;
  projectStatus?: string | null;
};

export type GroupedSearchResults = {
  tasks: SearchResult[];
  events: SearchResult[];
  notes: SearchResult[];
  projects: SearchResult[];
  total: number;
};

// ===========================
// Global Search
// ===========================

/**
 * Global search across all entities (tasks, events, notes, projects)
 * Returns results grouped by entity type
 */
export async function globalSearch(
  query: string,
  options?: {
    limit?: number;
    entityTypes?: SearchEntityType[];
    includeDeleted?: boolean;
    includeArchived?: boolean;
  }
): Promise<GroupedSearchResults> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const limit = options?.limit ?? 10;
  const entityTypes = options?.entityTypes ?? ["task", "event", "note", "project"];

  const searchPattern = `%${query}%`;

  // Parallel search across all entity types
  const [tasks, events, notes, projects] = await Promise.all([
    // Search tasks
    entityTypes.includes("task")
      ? db
          .select({
            id: task.id,
            title: task.title,
            description: task.description,
            projectId: task.projectId,
            projectName: project.name,
            projectColor: project.color,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
          })
          .from(task)
          .leftJoin(project, eq(task.projectId, project.id))
          .where(
            and(
              eq(task.userId, userId),
              or(ilike(task.title, searchPattern), ilike(task.description, searchPattern)),
              ...(options?.includeDeleted ? [] : [isNull(task.deletedAt)]),
              ...(options?.includeArchived ? [] : [isNull(task.archivedAt)])
            )
          )
          .limit(limit)
      : Promise.resolve([]),

    // Search events
    entityTypes.includes("event")
      ? db
          .select({
            id: event.id,
            title: event.title,
            description: event.description,
            projectId: event.projectId,
            projectName: project.name,
            projectColor: project.color,
            startTime: event.startTime,
            location: event.location,
          })
          .from(event)
          .leftJoin(project, eq(event.projectId, project.id))
          .where(
            and(
              eq(event.userId, userId),
              or(
                ilike(event.title, searchPattern),
                ilike(event.description, searchPattern),
                ilike(event.location, searchPattern)
              ),
              ...(options?.includeDeleted ? [] : [isNull(event.deletedAt)]),
              ...(options?.includeArchived ? [] : [isNull(event.archivedAt)])
            )
          )
          .limit(limit)
      : Promise.resolve([]),

    // Search notes
    entityTypes.includes("note")
      ? db
          .select({
            id: note.id,
            title: note.title,
            content: note.content,
            projectId: note.projectId,
            projectName: project.name,
            projectColor: project.color,
            noteType: note.type,
          })
          .from(note)
          .leftJoin(project, eq(note.projectId, project.id))
          .where(
            and(
              eq(note.userId, userId),
              or(ilike(note.title, searchPattern), ilike(note.content, searchPattern)),
              ...(options?.includeDeleted ? [] : [isNull(note.deletedAt)]),
              ...(options?.includeArchived ? [] : [isNull(note.archivedAt)])
            )
          )
          .limit(limit)
      : Promise.resolve([]),

    // Search projects
    entityTypes.includes("project")
      ? db
          .select({
            id: project.id,
            name: project.name,
            description: project.description,
            color: project.color,
            projectStatus: project.status,
          })
          .from(project)
          .where(
            and(
              eq(project.userId, userId),
              or(ilike(project.name, searchPattern), ilike(project.description, searchPattern)),
              ...(options?.includeDeleted ? [] : [isNull(project.deletedAt)]),
              ...(options?.includeArchived ? [] : [isNull(project.archivedAt)])
            )
          )
          .limit(limit)
      : Promise.resolve([]),
  ]);

  // Map results to SearchResult format
  const taskResults: SearchResult[] = tasks.map((t) => ({
    id: t.id,
    type: "task" as const,
    title: t.title,
    description: t.description,
    projectId: t.projectId,
    projectName: t.projectName,
    projectColor: t.projectColor,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
  }));

  const eventResults: SearchResult[] = events.map((e) => ({
    id: e.id,
    type: "event" as const,
    title: e.title,
    description: e.description,
    projectId: e.projectId,
    projectName: e.projectName,
    projectColor: e.projectColor,
    startTime: e.startTime,
  }));

  const noteResults: SearchResult[] = notes.map((n) => ({
    id: n.id,
    type: "note" as const,
    title: n.title || "Untitled",
    description: n.content?.substring(0, 150),
    projectId: n.projectId,
    projectName: n.projectName,
    projectColor: n.projectColor,
    noteType: n.noteType,
  }));

  const projectResults: SearchResult[] = projects.map((p) => ({
    id: p.id,
    type: "project" as const,
    title: p.name,
    description: p.description,
    projectColor: p.color,
    projectStatus: p.projectStatus,
  }));

  return {
    tasks: taskResults,
    events: eventResults,
    notes: noteResults,
    projects: projectResults,
    total: taskResults.length + eventResults.length + noteResults.length + projectResults.length,
  };
}

/**
 * Get recent items (used when search is empty)
 */
export async function getRecentItems(limit: number = 8): Promise<GroupedSearchResults> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Get recent items from each entity type
  const [tasks, events, notes, projects] = await Promise.all([
    // Recent tasks
    db
      .select({
        id: task.id,
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        projectName: project.name,
        projectColor: project.color,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
      })
      .from(task)
      .leftJoin(project, eq(task.projectId, project.id))
      .where(and(eq(task.userId, userId), isNull(task.deletedAt), isNull(task.archivedAt)))
      .orderBy(sql`${task.updatedAt} DESC`)
      .limit(limit),

    // Recent events
    db
      .select({
        id: event.id,
        title: event.title,
        description: event.description,
        projectId: event.projectId,
        projectName: project.name,
        projectColor: project.color,
        startTime: event.startTime,
      })
      .from(event)
      .leftJoin(project, eq(event.projectId, project.id))
      .where(and(eq(event.userId, userId), isNull(event.deletedAt), isNull(event.archivedAt)))
      .orderBy(sql`${event.updatedAt} DESC`)
      .limit(limit),

    // Recent notes
    db
      .select({
        id: note.id,
        title: note.title,
        content: note.content,
        projectId: note.projectId,
        projectName: project.name,
        projectColor: project.color,
        noteType: note.type,
      })
      .from(note)
      .leftJoin(project, eq(note.projectId, project.id))
      .where(and(eq(note.userId, userId), isNull(note.deletedAt), isNull(note.archivedAt)))
      .orderBy(sql`${note.updatedAt} DESC`)
      .limit(limit),

    // Recent projects
    db
      .select({
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        projectStatus: project.status,
      })
      .from(project)
      .where(and(eq(project.userId, userId), isNull(project.deletedAt), isNull(project.archivedAt)))
      .orderBy(sql`${project.updatedAt} DESC`)
      .limit(limit),
  ]);

  // Map results
  const taskResults: SearchResult[] = tasks.map((t) => ({
    id: t.id,
    type: "task" as const,
    title: t.title,
    description: t.description,
    projectId: t.projectId,
    projectName: t.projectName,
    projectColor: t.projectColor,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
  }));

  const eventResults: SearchResult[] = events.map((e) => ({
    id: e.id,
    type: "event" as const,
    title: e.title,
    description: e.description,
    projectId: e.projectId,
    projectName: e.projectName,
    projectColor: e.projectColor,
    startTime: e.startTime,
  }));

  const noteResults: SearchResult[] = notes.map((n) => ({
    id: n.id,
    type: "note" as const,
    title: n.title || "Untitled",
    description: n.content?.substring(0, 150),
    projectId: n.projectId,
    projectName: n.projectName,
    projectColor: n.projectColor,
    noteType: n.noteType,
  }));

  const projectResults: SearchResult[] = projects.map((p) => ({
    id: p.id,
    type: "project" as const,
    title: p.name,
    description: p.description,
    projectColor: p.color,
    projectStatus: p.projectStatus,
  }));

  return {
    tasks: taskResults,
    events: eventResults,
    notes: noteResults,
    projects: projectResults,
    total: taskResults.length + eventResults.length + noteResults.length + projectResults.length,
  };
}
