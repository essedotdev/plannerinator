"use server";

import { db } from "@/db";
import { event, note, project, task, entityTag } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { and, asc, count, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";
import { projectFilterSchema, type ProjectFilterInput, type ProjectStatsInput } from "./schema";

/**
 * Project Database Queries
 *
 * All queries include:
 * - Authentication check
 * - User isolation (only return user's projects)
 * - Input validation (Zod)
 */

// ============================================================================
// GET PROJECTS (with filters, pagination, sorting)
// ============================================================================

/**
 * Get projects with filters, pagination, and sorting
 *
 * @param filters - Filter options (status, parent, date range, search, pagination, sorting)
 * @returns Projects array and pagination info
 */
export async function getProjects(filters: ProjectFilterInput = {}) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view projects");
  }

  // 2. Validate filters
  const validatedFilters = projectFilterSchema.parse(filters);
  const {
    status,
    parentProjectId,
    startDateFrom,
    startDateTo,
    endDateFrom,
    endDateTo,
    search,
    limit = 50,
    offset = 0,
    sortBy = "updatedAt",
    sortOrder = "desc",
  } = validatedFilters;

  // 3. Build WHERE conditions
  const conditions = [eq(project.userId, session.user.id)];

  // Status filter
  if (status) {
    conditions.push(eq(project.status, status));
  }

  // Parent project filter
  if (parentProjectId !== undefined) {
    if (parentProjectId === null) {
      // Root projects only (no parent)
      conditions.push(isNull(project.parentProjectId));
    } else {
      conditions.push(eq(project.parentProjectId, parentProjectId));
    }
  }

  // Date range filters
  if (startDateFrom) {
    conditions.push(gte(project.startDate, startDateFrom.toISOString()));
  }
  if (startDateTo) {
    conditions.push(lte(project.startDate, startDateTo.toISOString()));
  }
  if (endDateFrom) {
    conditions.push(gte(project.endDate, endDateFrom.toISOString()));
  }
  if (endDateTo) {
    conditions.push(lte(project.endDate, endDateTo.toISOString()));
  }

  // Search filter (case-insensitive search in name and description)
  if (search) {
    conditions.push(
      or(ilike(project.name, `%${search}%`), ilike(project.description, `%${search}%`))!
    );
  }

  // Tag filtering
  // If tagIds are provided, filter projects that have the specified tags
  // - OR logic: project has at least one of the tags
  // - AND logic: project has all of the tags
  if (validatedFilters.tagIds && validatedFilters.tagIds.length > 0) {
    const tagLogic = validatedFilters.tagLogic || "OR";

    if (tagLogic === "OR") {
      // OR logic: project has at least one of the tags
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${entityTag}
          WHERE ${entityTag.entityType} = 'project'
          AND ${entityTag.entityId} = ${project.id}
          AND ${entityTag.tagId} = ANY(${sql`ARRAY[${sql.join(
            validatedFilters.tagIds.map((id) => sql`${id}::uuid`),
            sql`, `
          )}]`})
        )`
      );
    } else {
      // AND logic: project has all of the tags
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${entityTag}
          WHERE ${entityTag.entityType} = 'project'
          AND ${entityTag.entityId} = ${project.id}
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

  // 4. Build ORDER BY
  const orderByColumn = {
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    name: project.name,
    startDate: project.startDate,
  }[sortBy];

  const orderByClause = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

  // 5. Execute query with pagination
  const projects = await db
    .select()
    .from(project)
    .where(and(...conditions))
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  // 6. Get total count for pagination
  const [{ total }] = await db
    .select({ total: count() })
    .from(project)
    .where(and(...conditions));

  return {
    projects,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + projects.length < total,
    },
  };
}

// ============================================================================
// GET PROJECT BY ID
// ============================================================================

/**
 * Get a single project by ID with related entity counts
 *
 * @param id - Project ID
 * @returns Project object with parent project and counts
 */
export async function getProjectById(id: string) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view projects");
  }

  // 2. Get project with parent
  const foundProject = await db.query.project.findFirst({
    where: and(eq(project.id, id), eq(project.userId, session.user.id)),
    with: {
      parentProject: true,
    },
  });

  if (!foundProject) {
    throw new Error("Project not found");
  }

  // 3. Get counts for related entities
  const [taskCount] = await db
    .select({ count: count() })
    .from(task)
    .where(and(eq(task.projectId, id), eq(task.userId, session.user.id)));

  const [eventCount] = await db
    .select({ count: count() })
    .from(event)
    .where(and(eq(event.projectId, id), eq(event.userId, session.user.id)));

  const [noteCount] = await db
    .select({ count: count() })
    .from(note)
    .where(and(eq(note.projectId, id), eq(note.userId, session.user.id)));

  return {
    ...foundProject,
    counts: {
      tasks: taskCount.count,
      events: eventCount.count,
      notes: noteCount.count,
    },
  };
}

// ============================================================================
// GET PROJECT STATISTICS
// ============================================================================

/**
 * Get detailed statistics for a project
 *
 * @param input - Project stats input (projectId, includeSubprojects)
 * @returns Detailed project statistics
 */
export async function getProjectStats(input: ProjectStatsInput) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view project stats");
  }

  const { projectId, includeSubprojects = false } = input;

  // 2. Verify project ownership
  const foundProject = await db.query.project.findFirst({
    where: and(eq(project.id, projectId), eq(project.userId, session.user.id)),
  });

  if (!foundProject) {
    throw new Error("Project not found");
  }

  // 3. Build project ID list (current + subprojects if requested)
  let projectIds = [projectId];
  if (includeSubprojects) {
    const subprojects = await db
      .select({ id: project.id })
      .from(project)
      .where(and(eq(project.parentProjectId, projectId), eq(project.userId, session.user.id)));
    projectIds = [projectId, ...subprojects.map((p) => p.id)];
  }

  // 4. Get task statistics
  const taskStats = await db
    .select({
      status: task.status,
      count: count(),
    })
    .from(task)
    .where(and(sql`${task.projectId} = ANY(${projectIds})`, eq(task.userId, session.user.id)))
    .groupBy(task.status);

  const tasksByStatus = {
    todo: 0,
    in_progress: 0,
    done: 0,
    cancelled: 0,
  };

  let totalTasks = 0;
  taskStats.forEach((stat) => {
    tasksByStatus[stat.status as keyof typeof tasksByStatus] = stat.count;
    totalTasks += stat.count;
  });

  const completedTasks = tasksByStatus.done;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 5. Get upcoming events count
  const [upcomingEventsResult] = await db
    .select({ count: count() })
    .from(event)
    .where(
      and(
        sql`${event.projectId} = ANY(${projectIds})`,
        eq(event.userId, session.user.id),
        gte(event.startTime, new Date())
      )
    );

  // 6. Get total notes count
  const [notesResult] = await db
    .select({ count: count() })
    .from(note)
    .where(and(sql`${note.projectId} = ANY(${projectIds})`, eq(note.userId, session.user.id)));

  return {
    projectId,
    includeSubprojects,
    tasks: {
      total: totalTasks,
      byStatus: tasksByStatus,
      completed: completedTasks,
      completionPercentage,
    },
    upcomingEvents: upcomingEventsResult.count,
    notes: notesResult.count,
  };
}

// ============================================================================
// GET SUBPROJECTS
// ============================================================================

/**
 * Get all subprojects for a parent project
 *
 * @param parentId - Parent project ID
 * @returns Array of subprojects
 */
export async function getSubprojects(parentId: string) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view subprojects");
  }

  // 2. Get subprojects
  const subprojects = await db
    .select()
    .from(project)
    .where(and(eq(project.parentProjectId, parentId), eq(project.userId, session.user.id)))
    .orderBy(desc(project.createdAt));

  return subprojects;
}

// ============================================================================
// SEARCH PROJECTS
// ============================================================================

/**
 * Search projects by name or description
 *
 * @param query - Search query string
 * @param limit - Max results (default 20)
 * @returns Array of matching projects
 */
export async function searchProjects(query: string, limit = 20) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to search projects");
  }

  // 2. Search (case-insensitive in name and description)
  const results = await db
    .select()
    .from(project)
    .where(
      and(
        eq(project.userId, session.user.id),
        or(ilike(project.name, `%${query}%`), ilike(project.description, `%${query}%`))!
      )
    )
    .orderBy(desc(project.updatedAt))
    .limit(limit);

  return results;
}

// ============================================================================
// GET ROOT PROJECTS
// ============================================================================

/**
 * Get all root projects (projects without a parent)
 *
 * @returns Array of root projects
 */
export async function getRootProjects() {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view projects");
  }

  // 2. Get root projects
  const rootProjects = await db
    .select()
    .from(project)
    .where(and(eq(project.userId, session.user.id), isNull(project.parentProjectId)))
    .orderBy(desc(project.updatedAt));

  return rootProjects;
}
