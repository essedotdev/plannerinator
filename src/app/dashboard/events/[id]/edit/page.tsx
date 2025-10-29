import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common";
import { EventForm } from "@/components/events/EventForm";
import { TagsCard } from "@/components/tags/TagsCard";
import { ParentEventCard } from "@/components/events/ParentEventCard";
import { CommentThread } from "@/components/comments/CommentThread";
import { EntityLinksSection } from "@/components/links/EntityLinksSection";
import { AttachmentsSection } from "@/components/attachments/AttachmentsSection";
import { getEventById } from "@/features/events/queries";
import { getEntityTags } from "@/features/tags/queries";
import { getEntityComments } from "@/features/comments/queries";
import { getEntityLinks } from "@/features/links/queries";
import { getAttachmentsByEntity } from "@/features/attachments/queries";
import { getSession } from "@/lib/auth";

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
      <EventForm mode="edit" initialData={eventData} />

      {/* Tags and Parent Event - Side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TagsCard mode="edit" entityType="event" entityId={id} initialTags={tags} />
        <ParentEventCard mode="edit" eventId={id} parentEvent={eventData.parentEvent} />
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
