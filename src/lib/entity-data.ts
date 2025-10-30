import { getEntityTags } from "@/features/tags/queries";
import { getEntityComments } from "@/features/comments/queries";
import { getEntityLinks } from "@/features/links/queries";
import { getAttachmentsByEntity } from "@/features/attachments/queries";
import type { EntityType } from "@/features/tags/schema";
import type { AttachmentEntityType } from "@/features/attachments/schema";

/**
 * Common entity page data including tags, comments, links, and attachments
 */
export interface EntityPageData {
  tags: Awaited<ReturnType<typeof getEntityTags>>;
  comments: Awaited<ReturnType<typeof getEntityComments>>;
  links: Awaited<ReturnType<typeof getEntityLinks>>;
  attachments: Awaited<ReturnType<typeof getAttachmentsByEntity>>;
}

/**
 * Fetches all common entity page data in parallel.
 *
 * This utility handles the common pattern of fetching tags, comments,
 * links, and attachments for an entity page (both view and edit modes).
 *
 * Uses Promise.all for optimal performance by fetching all data concurrently.
 *
 * @param entityType - The type of entity (task, event, note, project)
 * @param entityId - The ID of the entity
 * @returns Promise that resolves to an object containing all entity data
 *
 * @example
 * ```ts
 * // In a page component
 * const { tags, comments, links, attachments } = await fetchEntityPageData(
 *   'task',
 *   taskId
 * );
 * ```
 */
export async function fetchEntityPageData(
  entityType: EntityType,
  entityId: string
): Promise<EntityPageData> {
  const [tags, comments, links, attachments] = await Promise.all([
    getEntityTags({ entityType, entityId }),
    getEntityComments({ entityType, entityId }),
    getEntityLinks({ entityType, entityId }),
    getAttachmentsByEntity(entityType as AttachmentEntityType, entityId),
  ]);

  return {
    tags,
    comments,
    links,
    attachments,
  };
}
