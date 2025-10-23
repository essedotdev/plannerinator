"use client";

import { useState } from "react";
import { EventList } from "./EventList";
import { EventCalendar } from "./EventCalendar";
import { Button } from "@/components/ui/button";
import { Calendar, List } from "lucide-react";

interface Event {
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
}

interface EventsViewProps {
  events: Event[];
  defaultView?: "list" | "calendar";
}

export function EventsView({ events, defaultView = "list" }: EventsViewProps) {
  const [view, setView] = useState<"list" | "calendar">(defaultView);

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={view === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("list")}
        >
          <List className="h-4 w-4 mr-2" />
          List
        </Button>
        <Button
          variant={view === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("calendar")}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Calendar
        </Button>
      </div>

      {/* Render appropriate view */}
      {view === "list" ? <EventList events={events} /> : <EventCalendar events={events} />}
    </div>
  );
}
