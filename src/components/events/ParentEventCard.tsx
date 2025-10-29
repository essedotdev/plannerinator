"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatFullDate } from "@/lib/dates";
import { getEventsForParentSelection } from "@/features/events/parent-actions";
import { updateEvent } from "@/features/events/actions";
import type { Event } from "@/db/schema";

type EventOption = Pick<Event, "id" | "title" | "startTime">;

interface ParentEventCardProps {
  mode: "create" | "edit" | "view";
  eventId?: string; // Required for edit mode
  parentEvent?: {
    id: string;
    title: string;
    startTime: Date;
  } | null;
  onParentChange?: (parentId: string | undefined) => void; // For create mode
}

/**
 * ParentEventCard Component
 *
 * Displays and manages parent event relationship across different modes:
 * - view: Read-only display of parent event as link
 * - edit: Allows changing parent event with immediate save
 * - create: Allows selecting parent event (value managed by parent component)
 */
export function ParentEventCard({
  mode,
  eventId,
  parentEvent,
  onParentChange,
}: ParentEventCardProps) {
  const router = useRouter();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(mode !== "view");
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(
    parentEvent?.id || undefined
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Load available events for parent selection (edit and create modes)
  useEffect(() => {
    if (mode === "view") return;

    async function loadEvents() {
      try {
        const result = await getEventsForParentSelection(mode === "edit" ? eventId : undefined);
        if (result.success) {
          setEvents(result.events);
        } else {
          toast.error("Failed to load events");
        }
      } catch (error) {
        console.error("Failed to load events:", error);
        toast.error("Failed to load events");
      } finally {
        setLoadingEvents(false);
      }
    }
    loadEvents();
  }, [mode, eventId]);

  // Handle parent change in edit mode (immediate save)
  const handleParentChangeEdit = async (newParentId: string | undefined) => {
    if (mode !== "edit" || !eventId) return;

    setIsUpdating(true);
    try {
      await updateEvent(eventId, { parentEventId: newParentId || null });
      setSelectedParentId(newParentId);
      toast.success("Parent event updated");
      router.refresh();
    } catch {
      toast.error("Failed to update parent event");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle parent change in create mode (notify parent component)
  const handleParentChangeCreate = (newParentId: string | undefined) => {
    if (mode !== "create") return;
    setSelectedParentId(newParentId);
    onParentChange?.(newParentId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Parent Event</CardTitle>
      </CardHeader>
      <CardContent>
        {mode === "view" ? (
          // View mode: Read-only display
          parentEvent ? (
            <Link
              href={`/dashboard/events/${parentEvent.id}`}
              className="block hover:text-primary transition-colors"
            >
              <p className="font-medium">{parentEvent.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatFullDate(parentEvent.startTime)}
              </p>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">No parent event</p>
          )
        ) : (
          // Edit/Create mode: Parent event selector
          <div className="space-y-2">
            <Select
              value={selectedParentId || "none"}
              onValueChange={(value) => {
                const newValue = value === "none" ? undefined : value;
                if (mode === "edit") {
                  handleParentChangeEdit(newValue);
                } else {
                  handleParentChangeCreate(newValue);
                }
              }}
              disabled={loadingEvents || isUpdating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingEvents ? "Loading..." : "No parent event"} />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)]">
                <SelectItem value="none">No parent event</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    <span className="flex-1 truncate">{event.title}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
