import { getEventById } from "@/features/events/queries";
import { getEntityTags } from "@/features/tags/queries";
import { getEntityComments } from "@/features/comments/queries";
import { getEntityLinks } from "@/features/links/queries";
import { getAttachmentsByEntity } from "@/features/attachments/queries";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common";
import { EventForm } from "@/components/events/EventForm";
import { TagInput } from "@/components/tags/TagInput";
import { CommentThread } from "@/components/comments/CommentThread";
import { EntityLinksSection } from "@/components/links/EntityLinksSection";
import { AttachmentsSection } from "@/components/attachments/AttachmentsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";

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

  // Fetch tags, comments, links, and attachments in parallel
  const [tags, commentsData, links, attachments] = await Promise.all([
    getEntityTags({ entityType: "event", entityId: id }),
    getEntityComments({ entityType: "event", entityId: id }),
    getEntityLinks({ entityType: "event", entityId: id }),
    getAttachmentsByEntity("event", id),
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
