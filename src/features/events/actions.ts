"use server";

import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { event } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { syncAssignedToLink } from "@/features/links/helpers";
import { createEventSchema, updateEventSchema, type UpdateEventInput } from "./schema";

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
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to create an event");
  }

  // Validate input
  const data = createEventSchema.parse(input);

  try {
    const newEvent = await db.transaction(async (tx) => {
      const [createdEvent] = await tx
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

      return createdEvent;
    });

    // Revalidate events page
    revalidatePath("/dashboard/events");
    if (data.projectId) {
      revalidatePath(`/dashboard/projects/${data.projectId}`);
    }

    return { success: true, event: newEvent };
  } catch (error) {
    console.error("Error creating event:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create event");
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
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to update an event");
  }

  // Validate input
  const data = updateEventSchema.parse(input);

  try {
    // Verify ownership
    const existingEvent = await db.query.event.findFirst({
      where: and(eq(event.id, id), eq(event.userId, session.user.id)),
    });

    if (!existingEvent) {
      throw new Error("Event not found or you don't have permission to update it");
    }

    const updates: UpdateEventInput = { ...data };

    const updatedEvent = await db.transaction(async (tx) => {
      const [updated] = await tx.update(event).set(updates).where(eq(event.id, id)).returning();

      // Sync assigned_to link if projectId changed
      if ("projectId" in data) {
        await syncAssignedToLink(session.user.id, "event", id, data.projectId);
      }

      return updated;
    });

    // Revalidate relevant pages
    revalidatePath("/dashboard/events");
    revalidatePath(`/dashboard/events/${id}`);
    if (existingEvent.projectId) {
      revalidatePath(`/dashboard/projects/${existingEvent.projectId}`);
    }
    if (data.projectId && data.projectId !== existingEvent.projectId) {
      revalidatePath(`/dashboard/projects/${data.projectId}`);
    }

    return { success: true, event: updatedEvent };
  } catch (error) {
    console.error("Error updating event:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update event");
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete an event
 *
 * @param id - Event UUID
 * @returns Success status
 * @throws Error if user is not authenticated, event not found, or not authorized
 */
export async function deleteEvent(id: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to delete an event");
  }

  try {
    // Verify ownership before deleting
    const existingEvent = await db.query.event.findFirst({
      where: and(eq(event.id, id), eq(event.userId, session.user.id)),
    });

    if (!existingEvent) {
      throw new Error("Event not found or you don't have permission to delete it");
    }

    await db.delete(event).where(eq(event.id, id));

    // Revalidate relevant pages
    revalidatePath("/dashboard/events");
    if (existingEvent.projectId) {
      revalidatePath(`/dashboard/projects/${existingEvent.projectId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete event");
  }
}
