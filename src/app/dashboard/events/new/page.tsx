import { PageHeader } from "@/components/common";
import { EventForm } from "@/components/events/EventForm";

/**
 * Create new event page
 *
 * Supports pre-filling form from URL params:
 * - startTime: ISO date string
 * - endTime: ISO date string
 * - allDay: boolean
 */

interface NewEventPageProps {
  searchParams: Promise<{
    startTime?: string;
    endTime?: string;
    allDay?: string;
  }>;
}

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  const params = await searchParams;

  // Parse URL params for pre-filling form
  const initialData = params.startTime
    ? {
        startTime: new Date(params.startTime),
        endTime: params.endTime ? new Date(params.endTime) : undefined,
      }
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader title="New Event" description="Create a new event for your calendar" />
      <EventForm mode="create" initialData={initialData} />
    </div>
  );
}
