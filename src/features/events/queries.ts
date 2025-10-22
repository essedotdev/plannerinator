import { db } from "@/db";
import { event, project, link } from "@/db/schema";
import { eq, and, gte, lte, desc, asc, or, ilike, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { eventFilterSchema, type EventFilterInput } from "./schema";

// ============================================================================
// SINGLE EVENT QUERIES
// ============================================================================

/**
 * Get a single event by ID with relations
 *
 * Relations included:
 * - Project (if assigned)
 *
 * Future relations (not yet implemented):
 * - Tags
 * - Comments
 * - Links to other entities
 *
 * @param id - Event UUID
 * @returns Event with relations or null if not found
 * @throws Error if user is not authenticated
 */
export async function getEventById(id: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view events");
  }

  try {
    // Get event with project relation
    const [eventData] = await db
      .select({
        event: event,
        project: project,
      })
      .from(event)
      .leftJoin(
        link,
        and(
          eq(link.fromType, "event"),
          eq(link.fromId, event.id),
          eq(link.relationship, "assigned_to"),
          eq(link.toType, "project")
        )
      )
      .leftJoin(project, eq(link.toId, project.id))
      .where(and(eq(event.id, id), eq(event.userId, session.user.id)))
      .limit(1);

    if (!eventData) {
      return null;
    }

    return {
      ...eventData.event,
      project: eventData.project || null,
    };
  } catch (error) {
    console.error("Error fetching event:", error);
    throw new Error("Failed to fetch event");
  }
}

// ============================================================================
// EVENT LIST QUERIES
// ============================================================================

/**
 * Get events with optional filters, sorting, and pagination
 *
 * Filters:
 * - calendarType: Filter by calendar type (personal, work, family, other)
 * - projectId: Filter by project
 * - allDay: Filter by all-day events
 * - startTimeFrom/startTimeTo: Filter by start time range
 * - search: Full-text search in title and description
 *
 * Sorting:
 * - sortBy: createdAt, startTime, title
 * - sortOrder: asc or desc
 *
 * Pagination:
 * - limit: Max number of results (default 50)
 * - offset: Number of results to skip (default 0)
 *
 * @param filters - Event filter options
 * @returns Array of events with project relations
 * @throws Error if user is not authenticated
 */
export async function getEvents(filters: EventFilterInput = {}) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view events");
  }

  try {
    // Parse and validate filters
    const validatedFilters = eventFilterSchema.parse(filters);

    const {
      calendarType,
      projectId,
      allDay,
      startTimeFrom,
      startTimeTo,
      search,
      limit = 50,
      offset = 0,
      sortBy = "startTime",
      sortOrder = "asc",
    } = validatedFilters;

    // Build WHERE conditions
    const conditions = [eq(event.userId, session.user.id)];

    if (calendarType) {
      conditions.push(eq(event.calendarType, calendarType));
    }

    if (projectId) {
      conditions.push(eq(event.projectId, projectId));
    }

    if (allDay !== undefined) {
      conditions.push(eq(event.allDay, allDay));
    }

    if (startTimeFrom) {
      conditions.push(gte(event.startTime, startTimeFrom));
    }

    if (startTimeTo) {
      conditions.push(lte(event.startTime, startTimeTo));
    }

    if (search) {
      conditions.push(
        or(
          ilike(event.title, `%${search}%`),
          ilike(event.description, `%${search}%`),
          ilike(event.location, `%${search}%`)
        )!
      );
    }

    // Build ORDER BY clause
    const orderByColumn = {
      createdAt: event.createdAt,
      startTime: event.startTime,
      title: event.title,
    }[sortBy];

    const orderByFn = sortOrder === "asc" ? asc : desc;

    // Execute query with project relation
    const events = await db
      .select({
        event: event,
        project: project,
      })
      .from(event)
      .leftJoin(
        link,
        and(
          eq(link.fromType, "event"),
          eq(link.fromId, event.id),
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
      .from(event)
      .where(and(...conditions));

    const total = countResult?.count ?? 0;

    return {
      events: events.map((row) => ({
        ...row.event,
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
    console.error("Error fetching events:", error);
    throw new Error("Failed to fetch events");
  }
}

// ============================================================================
// SPECIALIZED QUERIES
// ============================================================================

/**
 * Get events within a date range (useful for calendar view)
 *
 * @param startDate - Range start date
 * @param endDate - Range end date
 * @returns Events within the date range, sorted by start time
 * @throws Error if user is not authenticated
 */
export async function getEventsByDateRange(startDate: Date, endDate: Date) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view events");
  }

  try {
    const events = await db
      .select({
        event: event,
        project: project,
      })
      .from(event)
      .leftJoin(
        link,
        and(
          eq(link.fromType, "event"),
          eq(link.fromId, event.id),
          eq(link.relationship, "assigned_to"),
          eq(link.toType, "project")
        )
      )
      .leftJoin(project, eq(link.toId, project.id))
      .where(
        and(
          eq(event.userId, session.user.id),
          gte(event.startTime, startDate),
          lte(event.startTime, endDate)
        )
      )
      .orderBy(asc(event.startTime));

    return events.map((row) => ({
      ...row.event,
      project: row.project || null,
    }));
  } catch (error) {
    console.error("Error fetching events by date range:", error);
    throw new Error("Failed to fetch events by date range");
  }
}

/**
 * Get upcoming events (future events sorted by start time)
 *
 * @param limit - Maximum number of events to return (default 10)
 * @returns Upcoming events
 * @throws Error if user is not authenticated
 */
export async function getUpcomingEvents(limit = 10) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view events");
  }

  try {
    const now = new Date();

    const events = await db
      .select({
        event: event,
        project: project,
      })
      .from(event)
      .leftJoin(
        link,
        and(
          eq(link.fromType, "event"),
          eq(link.fromId, event.id),
          eq(link.relationship, "assigned_to"),
          eq(link.toType, "project")
        )
      )
      .leftJoin(project, eq(link.toId, project.id))
      .where(and(eq(event.userId, session.user.id), gte(event.startTime, now)))
      .orderBy(asc(event.startTime))
      .limit(limit);

    return events.map((row) => ({
      ...row.event,
      project: row.project || null,
    }));
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    throw new Error("Failed to fetch upcoming events");
  }
}

/**
 * Get events by project ID
 *
 * @param projectId - Project UUID
 * @returns Events assigned to the project, sorted by start time
 * @throws Error if user is not authenticated
 */
export async function getEventsByProject(projectId: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view events");
  }

  try {
    const events = await db
      .select()
      .from(event)
      .where(and(eq(event.userId, session.user.id), eq(event.projectId, projectId)))
      .orderBy(asc(event.startTime));

    return events;
  } catch (error) {
    console.error("Error fetching events by project:", error);
    throw new Error("Failed to fetch events by project");
  }
}

/**
 * Get today's events
 *
 * @returns Events starting today
 * @throws Error if user is not authenticated
 */
export async function getTodaysEvents() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view events");
  }

  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const events = await db
      .select({
        event: event,
        project: project,
      })
      .from(event)
      .leftJoin(
        link,
        and(
          eq(link.fromType, "event"),
          eq(link.fromId, event.id),
          eq(link.relationship, "assigned_to"),
          eq(link.toType, "project")
        )
      )
      .leftJoin(project, eq(link.toId, project.id))
      .where(
        and(
          eq(event.userId, session.user.id),
          gte(event.startTime, startOfDay),
          lte(event.startTime, endOfDay)
        )
      )
      .orderBy(asc(event.startTime));

    return events.map((row) => ({
      ...row.event,
      project: row.project || null,
    }));
  } catch (error) {
    console.error("Error fetching today's events:", error);
    throw new Error("Failed to fetch today's events");
  }
}

/**
 * Search events by query string
 *
 * Searches in: title, description, location
 *
 * @param query - Search query
 * @param limit - Maximum number of results (default 20)
 * @returns Matching events
 * @throws Error if user is not authenticated
 */
export async function searchEvents(query: string, limit = 20) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to search events");
  }

  if (!query.trim()) {
    return [];
  }

  try {
    const events = await db
      .select({
        event: event,
        project: project,
      })
      .from(event)
      .leftJoin(
        link,
        and(
          eq(link.fromType, "event"),
          eq(link.fromId, event.id),
          eq(link.relationship, "assigned_to"),
          eq(link.toType, "project")
        )
      )
      .leftJoin(project, eq(link.toId, project.id))
      .where(
        and(
          eq(event.userId, session.user.id),
          or(
            ilike(event.title, `%${query}%`),
            ilike(event.description, `%${query}%`),
            ilike(event.location, `%${query}%`)
          )!
        )
      )
      .orderBy(desc(event.startTime))
      .limit(limit);

    return events.map((row) => ({
      ...row.event,
      project: row.project || null,
    }));
  } catch (error) {
    console.error("Error searching events:", error);
    throw new Error("Failed to search events");
  }
}
