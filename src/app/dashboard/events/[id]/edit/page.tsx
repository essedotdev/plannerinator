import { notFound } from "next/navigation";
import Link from "next/link";
import { Tag } from "lucide-react";
import { PageHeader } from "@/components/common";
import { EventForm } from "@/components/events/EventForm";
import { TagInput } from "@/components/tags/TagInput";
import { CommentThread } from "@/components/comments/CommentThread";
import { EntityLinksSection } from "@/components/links/EntityLinksSection";
import { AttachmentsSection } from "@/components/attachments/AttachmentsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventById } from "@/features/events/queries";
import { getEntityTags } from "@/features/tags/queries";
import { getEntityComments } from "@/features/comments/queries";
import { getEntityLinks } from "@/features/links/queries";
import { getAttachmentsByEntity } from "@/features/attachments/queries";
import { getSession } from "@/lib/auth";
import { formatFullDate } from "@/lib/dates";

/**
 * Event Edit Page
 *
 * Features:
 * - Edit event details
 * - Manage tags, comments, links, and attachments
 */

interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
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

  // Fetch tags, comments, links, and attachments in parallel
  const [tags, commentsData, links, attachments] = await Promise.all([
    getEntityTags({ entityType: "event", entityId: id }),
    getEntityComments({ entityType: "event", entityId: id }),
    getEntityLinks({ entityType: "event", entityId: id }),
    getAttachmentsByEntity("event", id),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Edit Event" description={`Editing event: ${eventData.title}`} backButton />

      {/* Event Form */}
      <EventForm
        mode="edit"
        initialData={{
          ...eventData,
          parentEventId: eventData.parentEventId,
        }}
      />

      {/* Tags and Parent Event - Side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tags Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TagInput entityType="event" entityId={id} initialTags={tags} />
          </CardContent>
        </Card>

        {/* Parent Event Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parent Event</CardTitle>
          </CardHeader>
          <CardContent>
            {eventData.parentEvent ? (
              <Link
                href={`/dashboard/events/${eventData.parentEvent.id}`}
                className="block hover:text-primary transition-colors"
              >
                <p className="font-medium">{eventData.parentEvent.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFullDate(eventData.parentEvent.startTime)}
                </p>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">No parent event</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attachments Section */}
      <AttachmentsSection entityType="event" entityId={id} initialAttachments={attachments} />

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
