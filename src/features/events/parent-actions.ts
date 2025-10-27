"use server";

import { getEvents } from "./queries";

/**
 * Server action to get events for parent selection
 * Used by client components (EventForm)
 */
export async function getEventsForParentSelection(excludeId?: string) {
  try {
    const result = await getEvents({
      sortBy: "startTime",
      sortOrder: "desc",
      limit: 100,
    });

    // Filter out the current event if provided
    const filteredEvents = excludeId
      ? result.events.filter((e) => e.id !== excludeId)
      : result.events;

    return {
      success: true,
      events: filteredEvents,
    };
  } catch (error) {
    console.error("Failed to load events:", error);
    return {
      success: false,
      events: [],
    };
  }
}
