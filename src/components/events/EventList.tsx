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
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No events found</p>
        <p className="text-sm text-muted-foreground mt-2">Create your first event to get started</p>
      </div>
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
