"use server";

import { db } from "@/db";
import { event } from "@/db/schema";
import { eq } from "drizzle-orm";
import { syncAssignedToLink } from "@/features/links/helpers";
import { createEventSchema, updateEventSchema, type UpdateEventInput } from "./schema";
import {
  validateSession,
  checkOwnership,
  revalidateEntityPaths,
  revalidateProjectChange,
  handleEntityError,
  copyEntityTags,
  softDeleteEntity,
  hardDeleteEntity,
  restoreEntityFromTrash,
  archiveEntity,
  restoreArchivedEntity,
} from "@/lib/entity-helpers";

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new event
 *
 * @param input - Event data conforming to CreateEventInput
 * @returns Created event object with id
 * @throws Error if user is not authenticated or validation fails
 */
export async function createEvent(input: unknown) {
  const session = await validateSession("create an event");

  // Validate input
  const data = createEventSchema.parse(input);

  try {
    // Create event
    const [createdEvent] = await db
      .insert(event)
      .values({
        ...data,
        userId: session.user.id,
        // allDay and calendarType use database defaults (false and 'personal')
      })
      .returning();

    // Sync assigned_to link if projectId is provided
    if (data.projectId) {
      await syncAssignedToLink(session.user.id, "event", createdEvent.id, data.projectId);
    }

    // Revalidate paths
    revalidateEntityPaths("event", undefined, data.projectId);

    return { success: true, event: createdEvent };
  } catch (error) {
    handleEntityError(error, "creating", "event");
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update an existing event
 *
 * @param id - Event UUID
 * @param input - Partial event data to update
 * @returns Updated event object
 * @throws Error if user is not authenticated, event not found, or not authorized
 */
export async function updateEvent(id: string, input: unknown) {
  const session = await validateSession("update an event");

  // Validate input
  const data = updateEventSchema.parse(input);

  try {
    // Verify ownership
    const existingEvent = await checkOwnership<typeof event.$inferSelect>(
      "event",
      id,
      session.user.id
    );

    const updates: UpdateEventInput = { ...data };

    // Update event
    const [updatedEvent] = await db.update(event).set(updates).where(eq(event.id, id)).returning();

    // Sync assigned_to link if projectId changed
    if ("projectId" in data) {
      await syncAssignedToLink(session.user.id, "event", id, data.projectId);
    }

    // Revalidate paths
    revalidateEntityPaths("event", id, existingEvent.projectId);
    revalidateProjectChange("event", existingEvent.projectId, data.projectId);

    return { success: true, event: updatedEvent };
  } catch (error) {
    handleEntityError(error, "updating", "event");
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Soft delete an event (move to trash)
 *
 * Sets deleted_at timestamp. Event can be restored within 30 days.
 *
 * @param id - Event UUID
 * @returns Success status
 * @throws Error if user is not authenticated, event not found, or not authorized
 */
export async function deleteEvent(id: string) {
  const session = await validateSession("delete an event");

  try {
    return await softDeleteEntity("event", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "deleting", "event");
  }
}

/**
 * Permanently delete an event (hard delete from trash)
 *
 * This action cannot be undone.
 *
 * @param id - Event UUID
 * @returns Success response
 */
export async function hardDeleteEvent(id: string) {
  const session = await validateSession("permanently delete an event");

  try {
    return await hardDeleteEntity("event", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "permanently deleting", "event");
  }
}

/**
 * Restore an event from trash
 *
 * @param id - Event UUID
 * @returns Success response
 */
export async function restoreFromTrashEvent(id: string) {
  const session = await validateSession("restore an event from trash");

  try {
    return await restoreEntityFromTrash("event", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "restoring", "event");
  }
}

/**
 * Duplicate an event
 *
 * Creates a copy of an existing event with:
 * - Title prefixed with "Copy of"
 * - Same description, location, calendar type, project assignment
 * - Dates/times cleared (user needs to set new dates)
 * - Tags copied
 * - Comments, links, and attachments NOT copied
 *
 * @param id - Event UUID to duplicate
 * @returns Newly created event object
 * @throws Error if user is not authenticated, event not found, or not authorized
 */
export async function duplicateEvent(id: string) {
  const session = await validateSession("duplicate an event");

  try {
    // Verify ownership
    const originalEvent = await checkOwnership<typeof event.$inferSelect>(
      "event",
      id,
      session.user.id
    );

    // Create duplicated event (dates cleared - user must set)
    const [duplicatedEvent] = await db
      .insert(event)
      .values({
        userId: session.user.id,
        title: `Copy of ${originalEvent.title}`,
        description: originalEvent.description,
        location: originalEvent.location,
        locationUrl: originalEvent.locationUrl,
        calendarType: originalEvent.calendarType,
        projectId: originalEvent.projectId,
        allDay: originalEvent.allDay,
        startTime: originalEvent.startTime, // Keep original time as reference
        endTime: originalEvent.endTime,
        metadata: originalEvent.metadata,
      })
      .returning();

    // Copy tags
    await copyEntityTags("event", id, "event", duplicatedEvent.id, session.user.id);

    // Sync assigned_to link if projectId exists
    if (duplicatedEvent.projectId) {
      await syncAssignedToLink(
        session.user.id,
        "event",
        duplicatedEvent.id,
        duplicatedEvent.projectId
      );
    }

    // Revalidate paths
    revalidateEntityPaths("event", undefined, duplicatedEvent.projectId);

    return { success: true, event: duplicatedEvent };
  } catch (error) {
    handleEntityError(error, "duplicating", "event");
  }
}

// ============================================================================
// ARCHIVE OPERATIONS
// ============================================================================

/**
 * Archive an event
 *
 * @param id - Event UUID to archive
 * @returns Success response
 */
export async function archiveEvent(id: string) {
  const session = await validateSession("archive an event");

  try {
    return await archiveEntity("event", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "archiving", "event");
  }
}

/**
 * Restore an archived event
 *
 * @param id - Event UUID to restore
 * @returns Success response
 */
export async function restoreEvent(id: string) {
  const session = await validateSession("restore an event from archive");

  try {
    return await restoreArchivedEntity("event", id, session.user.id);
  } catch (error) {
    handleEntityError(error, "restoring", "event");
  }
}
