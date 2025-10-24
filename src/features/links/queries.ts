"use server";

import { db } from "@/db";
import { link, task, event, note, project } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getEntityLinksSchema, type GetEntityLinksInput } from "./schema";

/**
 * Link Database Queries
 *
 * All queries include:
 * - Authentication check
 * - User isolation (only return user's links)
 * - Input validation (Zod)
 */

// ============================================================================
// GET ENTITY LINKS
// ============================================================================

/**
 * Get all links for a specific entity
 *
 * @param input - Entity type, entity ID, optional direction and relationship filter
 * @returns Array of links with resolved entity info
 */
export async function getEntityLinks(input: GetEntityLinksInput) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view links");
  }

  // 2. Validate input
  const {
    entityType,
    entityId,
    direction = "both",
    relationship,
  } = getEntityLinksSchema.parse(input);

  // 3. Build WHERE conditions
  const conditions = [eq(link.userId, session.user.id)];

  // Direction filter
  if (direction === "from") {
    conditions.push(and(eq(link.fromType, entityType), eq(link.fromId, entityId))!);
  } else if (direction === "to") {
    conditions.push(and(eq(link.toType, entityType), eq(link.toId, entityId))!);
  } else {
    // both directions
    conditions.push(
      or(
        and(eq(link.fromType, entityType), eq(link.fromId, entityId)),
        and(eq(link.toType, entityType), eq(link.toId, entityId))
      )!
    );
  }

  // Relationship filter
  if (relationship) {
    conditions.push(eq(link.relationship, relationship));
  }

  // 4. Get links
  const links = await db
    .select()
    .from(link)
    .where(and(...conditions))
    .orderBy(link.createdAt);

  // 5. Resolve linked entities (get titles/names)
  const resolvedLinks = await Promise.all(
    links.map(async (l) => {
      // Resolve "from" entity
      const fromEntity = await resolveEntity(l.fromType, l.fromId);

      // Resolve "to" entity
      const toEntity = await resolveEntity(l.toType, l.toId);

      return {
        ...l,
        fromEntity,
        toEntity,
      };
    })
  );

  return resolvedLinks;
}

// ============================================================================
// GET LINK BY ID
// ============================================================================

/**
 * Get a single link by ID with resolved entities
 *
 * @param id - Link ID
 * @returns Link object with resolved entities
 */
export async function getLinkById(id: string) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view links");
  }

  // 2. Get link
  const foundLink = await db.query.link.findFirst({
    where: and(eq(link.id, id), eq(link.userId, session.user.id)),
  });

  if (!foundLink) {
    throw new Error("Link not found");
  }

  // 3. Resolve entities
  const fromEntity = await resolveEntity(foundLink.fromType, foundLink.fromId);
  const toEntity = await resolveEntity(foundLink.toType, foundLink.toId);

  return {
    ...foundLink,
    fromEntity,
    toEntity,
  };
}

// ============================================================================
// HELPER: RESOLVE ENTITY
// ============================================================================

/**
 * Resolve entity info (title/name) from entity type and ID
 */
async function resolveEntity(entityType: string, entityId: string) {
  try {
    switch (entityType) {
      case "task": {
        const t = await db.query.task.findFirst({
          where: eq(task.id, entityId),
          columns: { id: true, title: true, status: true },
        });
        return t ? { type: "task" as const, id: t.id, title: t.title, status: t.status } : null;
      }

      case "event": {
        const e = await db.query.event.findFirst({
          where: eq(event.id, entityId),
          columns: { id: true, title: true, startTime: true },
        });
        return e
          ? { type: "event" as const, id: e.id, title: e.title, startTime: e.startTime }
          : null;
      }

      case "note": {
        const n = await db.query.note.findFirst({
          where: eq(note.id, entityId),
          columns: { id: true, title: true, type: true },
        });
        return n
          ? { type: "note" as const, id: n.id, title: n.title || "Untitled", noteType: n.type }
          : null;
      }

      case "project": {
        const p = await db.query.project.findFirst({
          where: eq(project.id, entityId),
          columns: { id: true, name: true, status: true, icon: true },
        });
        return p
          ? { type: "project" as const, id: p.id, title: p.name, status: p.status, icon: p.icon }
          : null;
      }

      default:
        return null;
    }
  } catch (error) {
    console.error(`Error resolving entity ${entityType}:${entityId}`, error);
    return null;
  }
}
