"use server";

import { db } from "@/db";
import { tag, entityTag } from "@/db/schema";
import { eq, and, ilike, asc, desc, count, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { tagFilterSchema, type TagFilterInput, type GetEntityTagsInput } from "./schema";

/**
 * Tag Database Queries
 *
 * All queries include:
 * - Authentication check
 * - User isolation (only return user's tags)
 * - Input validation (Zod)
 */

// ============================================================================
// GET TAGS (with filters, pagination, sorting)
// ============================================================================

/**
 * Get tags with filters, pagination, and sorting
 *
 * @param filters - Filter options (search, pagination, sorting)
 * @returns Tags array and pagination info
 */
export async function getTags(filters: TagFilterInput = {}) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view tags");
  }

  // 2. Validate filters
  const validatedFilters = tagFilterSchema.parse(filters);
  const { search, limit = 50, offset = 0, sortBy = "name", sortOrder = "asc" } = validatedFilters;

  // 3. Build WHERE conditions
  const conditions = [eq(tag.userId, session.user.id)];

  // Search filter (case-insensitive search in name)
  if (search) {
    conditions.push(ilike(tag.name, `%${search}%`));
  }

  // 4. Build ORDER BY
  const orderByColumn = {
    name: tag.name,
    createdAt: tag.createdAt,
  }[sortBy];

  const orderByClause = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

  // 5. Execute query with pagination
  const tags = await db
    .select()
    .from(tag)
    .where(and(...conditions))
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  // 6. Get total count for pagination
  const [{ total }] = await db
    .select({ total: count() })
    .from(tag)
    .where(and(...conditions));

  return {
    tags,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + tags.length < total,
    },
  };
}

// ============================================================================
// GET TAG BY ID
// ============================================================================

/**
 * Get a single tag by ID with usage count
 *
 * @param id - Tag ID
 * @returns Tag object with usage count
 */
export async function getTagById(id: string) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view tags");
  }

  // 2. Get tag
  const foundTag = await db.query.tag.findFirst({
    where: and(eq(tag.id, id), eq(tag.userId, session.user.id)),
  });

  if (!foundTag) {
    throw new Error("Tag not found");
  }

  // 3. Get usage count (how many entities use this tag)
  const [{ usageCount }] = await db
    .select({ usageCount: count() })
    .from(entityTag)
    .where(and(eq(entityTag.tagId, id), eq(entityTag.userId, session.user.id)));

  return {
    ...foundTag,
    usageCount,
  };
}

// ============================================================================
// GET ENTITY TAGS
// ============================================================================

/**
 * Get all tags assigned to a specific entity
 *
 * @param input - Entity type and entity ID
 * @returns Array of tags assigned to the entity
 */
export async function getEntityTags(input: GetEntityTagsInput) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view entity tags");
  }

  const { entityType, entityId } = input;

  // 2. Get tags via join
  const entityTags = await db
    .select({
      tag: tag,
    })
    .from(entityTag)
    .innerJoin(tag, eq(entityTag.tagId, tag.id))
    .where(
      and(
        eq(entityTag.userId, session.user.id),
        eq(entityTag.entityType, entityType),
        eq(entityTag.entityId, entityId)
      )
    )
    .orderBy(asc(tag.name));

  return entityTags.map((row) => row.tag);
}

// ============================================================================
// GET TAG USAGE STATS
// ============================================================================

/**
 * Get usage statistics for all tags
 *
 * Returns tags with their usage count per entity type
 *
 * @returns Array of tags with usage statistics
 */
export async function getTagUsageStats() {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view tag stats");
  }

  // 2. Get tags with usage counts by entity type
  const stats = await db
    .select({
      tag: tag,
      entityType: entityTag.entityType,
      count: count(),
    })
    .from(tag)
    .leftJoin(entityTag, eq(tag.id, entityTag.tagId))
    .where(eq(tag.userId, session.user.id))
    .groupBy(tag.id, tag.userId, tag.name, tag.color, tag.createdAt, entityTag.entityType)
    .orderBy(asc(tag.name));

  // 3. Aggregate by tag
  const tagMap = new Map<
    string,
    {
      tag: typeof tag.$inferSelect;
      usageByType: Record<string, number>;
      totalUsage: number;
    }
  >();

  stats.forEach((stat) => {
    const tagId = stat.tag.id;

    if (!tagMap.has(tagId)) {
      tagMap.set(tagId, {
        tag: stat.tag,
        usageByType: {},
        totalUsage: 0,
      });
    }

    const tagStat = tagMap.get(tagId)!;

    if (stat.entityType) {
      tagStat.usageByType[stat.entityType] = stat.count;
      tagStat.totalUsage += stat.count;
    }
  });

  return Array.from(tagMap.values());
}

// ============================================================================
// SEARCH TAGS
// ============================================================================

/**
 * Search tags by name
 *
 * @param query - Search query string
 * @param limit - Max results (default 20)
 * @returns Array of matching tags
 */
export async function searchTags(query: string, limit = 20) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to search tags");
  }

  // 2. Search (case-insensitive in name)
  const results = await db
    .select()
    .from(tag)
    .where(and(eq(tag.userId, session.user.id), ilike(tag.name, `%${query}%`)))
    .orderBy(asc(tag.name))
    .limit(limit);

  return results;
}

// ============================================================================
// GET POPULAR TAGS
// ============================================================================

/**
 * Get most popular tags (by usage count)
 *
 * @param limit - Max results (default 10)
 * @returns Array of tags with usage count, sorted by popularity
 */
export async function getPopularTags(limit = 10) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view popular tags");
  }

  // 2. Get tags with usage counts
  const popularTags = await db
    .select({
      tag: tag,
      usageCount: sql<number>`count(${entityTag.id})::int`,
    })
    .from(tag)
    .leftJoin(entityTag, eq(tag.id, entityTag.tagId))
    .where(eq(tag.userId, session.user.id))
    .groupBy(tag.id)
    .orderBy(desc(sql`count(${entityTag.id})`), asc(tag.name))
    .limit(limit);

  return popularTags;
}
