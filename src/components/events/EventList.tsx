import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common";
import { EventCard } from "./EventCard";

interface EventListProps {
  events: Array<{
    id: string;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date | null;
    allDay: boolean;
    location: string | null;
    calendarType: "personal" | "work" | "family" | "other";
    project?: {
      id: string;
      name: string;
      color: string | null;
    } | null;
  }>;
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No events found"
        description="Create your first event to keep track of important dates"
        action={
          <Button asChild>
            <Link href="/dashboard/events/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
