import { getEventById } from "@/features/events/queries";
import { getEntityTags } from "@/features/tags/queries";
import { getEntityComments } from "@/features/comments/queries";
import { getEntityLinks } from "@/features/links/queries";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common";
import { EventForm } from "@/components/events/EventForm";
import { TagInput } from "@/components/tags/TagInput";
import { CommentThread } from "@/components/comments/CommentThread";
import { EntityLinksSection } from "@/components/links/EntityLinksSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, FolderOpen, Globe } from "lucide-react";
import { formatDateTime } from "@/lib/dates";
import { EVENT_CALENDAR_TYPE_LABELS } from "@/lib/labels";

/**
 * Event detail page
 *
 * Features:
 * - View event details
 * - Edit event
 * - View related project
 */

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;

  const eventData = await getEventById(id);

  if (!eventData) {
    notFound();
  }

  // Get current user session
  const session = await getSession();
  if (!session?.user) {
    notFound();
  }

  // Fetch tags, comments, and links in parallel
  const [tags, commentsData, links] = await Promise.all([
    getEntityTags({ entityType: "event", entityId: id }),
    getEntityComments({ entityType: "event", entityId: id }),
    getEntityLinks({ entityType: "event", entityId: id }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Event Details"
        description={`Viewing event: ${eventData.title}`}
        backButton
      />

      {/* Edit Form */}
      <EventForm mode="edit" initialData={eventData} />

      {/* Additional Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Start Time */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Start Time</p>
              <p className="font-medium">{formatDateTime(eventData.startTime)}</p>
            </div>
          </div>

          {/* End Time */}
          {eventData.endTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">End Time</p>
                <p className="font-medium">{formatDateTime(eventData.endTime)}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {eventData.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{eventData.location}</p>
                {eventData.locationUrl && (
                  <a
                    href={eventData.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    <Globe className="h-3 w-3" />
                    View on map
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Project */}
          {eventData.project && (
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Project</p>
                <p className="font-medium">{eventData.project.name}</p>
              </div>
            </div>
          )}

          {/* Calendar Type & All Day */}
          <div className="flex gap-2">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Calendar Type</p>
              <Badge variant="outline">{EVENT_CALENDAR_TYPE_LABELS[eventData.calendarType]}</Badge>
            </div>
            {eventData.allDay && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Duration</p>
                <Badge>All Day</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tags Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <TagInput entityType="event" entityId={id} initialTags={tags} />
        </CardContent>
      </Card>

      {/* Links Section */}
      <EntityLinksSection entityType="event" entityId={id} initialLinks={links} />

      {/* Comments Section */}
      <CommentThread
        entityType="event"
        entityId={id}
        currentUserId={session.user.id}
        initialComments={commentsData.comments}
      />
    </div>
  );
}
