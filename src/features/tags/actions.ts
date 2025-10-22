"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tag, entityTag } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { createTagSchema, updateTagSchema, assignTagSchema, removeTagSchema } from "./schema";

/**
 * Tag Server Actions
 *
 * All actions include:
 * - Authentication check
 * - Input validation (Zod)
 * - Authorization (user owns the tag)
 * - Revalidation (cache invalidation)
 */

// ============================================================================
// CREATE TAG
// ============================================================================

/**
 * Create a new tag
 *
 * @param input - Tag data (validated against createTagSchema)
 * @returns Created tag object
 */
export async function createTag(input: unknown) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to create tags");
  }

  // 2. Validate input
  const data = createTagSchema.parse(input);

  // 3. Check if tag with same name already exists for this user
  const existingTag = await db.query.tag.findFirst({
    where: and(eq(tag.userId, session.user.id), eq(tag.name, data.name)),
  });

  if (existingTag) {
    throw new Error("A tag with this name already exists");
  }

  // 4. Create tag
  const [newTag] = await db
    .insert(tag)
    .values({
      ...data,
      userId: session.user.id,
    })
    .returning();

  // 5. Revalidate cache
  revalidatePath("/dashboard");

  return { success: true, tag: newTag };
}

// ============================================================================
// UPDATE TAG
// ============================================================================

/**
 * Update an existing tag
 *
 * @param id - Tag ID
 * @param input - Partial tag data (validated against updateTagSchema)
 * @returns Updated tag object
 */
export async function updateTag(id: string, input: unknown) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to update tags");
  }

  // 2. Validate input
  const data = updateTagSchema.parse(input);

  // 3. Check ownership
  const existingTag = await db.query.tag.findFirst({
    where: and(eq(tag.id, id), eq(tag.userId, session.user.id)),
  });

  if (!existingTag) {
    throw new Error("Tag not found or you don't have permission to update it");
  }

  // 4. Check if new name conflicts with another tag
  if (data.name && data.name !== existingTag.name) {
    const nameConflict = await db.query.tag.findFirst({
      where: and(eq(tag.userId, session.user.id), eq(tag.name, data.name)),
    });

    if (nameConflict) {
      throw new Error("A tag with this name already exists");
    }
  }

  // 5. Update tag
  const [updatedTag] = await db.update(tag).set(data).where(eq(tag.id, id)).returning();

  // 6. Revalidate cache
  revalidatePath("/dashboard");

  return { success: true, tag: updatedTag };
}

// ============================================================================
// DELETE TAG
// ============================================================================

/**
 * Delete a tag (will cascade delete all entity_tag assignments)
 *
 * @param id - Tag ID
 */
export async function deleteTag(id: string) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to delete tags");
  }

  // 2. Check ownership
  const existingTag = await db.query.tag.findFirst({
    where: and(eq(tag.id, id), eq(tag.userId, session.user.id)),
  });

  if (!existingTag) {
    throw new Error("Tag not found or you don't have permission to delete it");
  }

  // 3. Delete tag (cascade to entity_tags)
  await db.delete(tag).where(eq(tag.id, id));

  // 4. Revalidate cache
  revalidatePath("/dashboard");

  return { success: true };
}

// ============================================================================
// ASSIGN TAGS TO ENTITY
// ============================================================================

/**
 * Assign one or more tags to an entity
 *
 * @param input - Entity type, entity ID, and tag IDs
 */
export async function assignTagsToEntity(input: unknown) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to assign tags");
  }

  // 2. Validate input
  const data = assignTagSchema.parse(input);

  // 3. Verify tags exist and belong to user
  const tags = await db.query.tag.findMany({
    where: and(inArray(tag.id, data.tagIds), eq(tag.userId, session.user.id)),
  });

  if (tags.length !== data.tagIds.length) {
    throw new Error("Some tags not found or you don't have permission");
  }

  // 4. Check if entity exists and belongs to user (basic check)
  // Note: For production, you should verify ownership of the specific entity

  // 5. Insert entity_tag records (skip duplicates)
  const existingAssignments = await db.query.entityTag.findMany({
    where: and(
      eq(entityTag.userId, session.user.id),
      eq(entityTag.entityType, data.entityType),
      eq(entityTag.entityId, data.entityId),
      inArray(entityTag.tagId, data.tagIds)
    ),
  });

  const existingTagIds = new Set(existingAssignments.map((a) => a.tagId));
  const newTagIds = data.tagIds.filter((tagId) => !existingTagIds.has(tagId));

  if (newTagIds.length > 0) {
    await db.insert(entityTag).values(
      newTagIds.map((tagId) => ({
        userId: session.user.id,
        entityType: data.entityType,
        entityId: data.entityId,
        tagId,
      }))
    );
  }

  // 6. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${data.entityType}s/${data.entityId}`);

  return { success: true, assignedCount: newTagIds.length };
}

// ============================================================================
// REMOVE TAGS FROM ENTITY
// ============================================================================

/**
 * Remove one or more tags from an entity
 *
 * @param input - Entity type, entity ID, and tag IDs
 */
export async function removeTagsFromEntity(input: unknown) {
  // 1. Authenticate
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to remove tags");
  }

  // 2. Validate input
  const data = removeTagSchema.parse(input);

  // 3. Delete entity_tag records
  await db
    .delete(entityTag)
    .where(
      and(
        eq(entityTag.userId, session.user.id),
        eq(entityTag.entityType, data.entityType),
        eq(entityTag.entityId, data.entityId),
        inArray(entityTag.tagId, data.tagIds)
      )
    );

  // 4. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${data.entityType}s/${data.entityId}`);

  return { success: true };
}
