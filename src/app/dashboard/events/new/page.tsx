import { PageHeader } from "@/components/common";
import { EventForm } from "@/components/events/EventForm";

/**
 * Create new event page
 */
export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Event" description="Create a new event for your calendar" />
      <EventForm mode="create" />
    </div>
  );
}
