import { getNoteById } from "@/features/notes/queries";
import { getEntityTags } from "@/features/tags/queries";
import { getEntityComments } from "@/features/comments/queries";
import { getEntityLinks } from "@/features/links/queries";
import { getAttachmentsByEntity } from "@/features/attachments/queries";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common";
import { NoteForm } from "@/components/notes/NoteForm";
import { TagInput } from "@/components/tags/TagInput";
import { CommentThread } from "@/components/comments/CommentThread";
import { EntityLinksSection } from "@/components/links/EntityLinksSection";
import { AttachmentsSection } from "@/components/attachments/AttachmentsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";
import Link from "next/link";

/**
 * Note detail page
 *
 * Features:
 * - View note details
 * - Edit note
 * - View related project
 * - View child notes
 */

interface NoteDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params;

  const noteData = await getNoteById(id);

  if (!noteData) {
    notFound();
  }

  // Get current user session
  const session = await getSession();
  if (!session?.user) {
    notFound();
  }

  // Fetch tags, comments, links, and attachments in parallel
  const [tags, commentsData, links, attachments] = await Promise.all([
    getEntityTags({ entityType: "note", entityId: id }),
    getEntityComments({ entityType: "note", entityId: id }),
    getEntityLinks({ entityType: "note", entityId: id }),
    getAttachmentsByEntity("note", id),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Note Details"
        description={noteData.title ? `Viewing note: ${noteData.title}` : "Viewing note"}
        backButton
      />

      {/* Edit Form */}
      <NoteForm mode="edit" initialData={noteData} />

      {/* Tags Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TagInput entityType="note" entityId={id} initialTags={tags} />
        </CardContent>
      </Card>

      {/* Parent Note Card */}
      {noteData.parentNote && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parent Note</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/dashboard/notes/${noteData.parentNote.id}`}
              className="block hover:text-primary transition-colors"
            >
              <p className="font-medium">{noteData.parentNote.title || "Untitled Note"}</p>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Child Notes Card */}
      {noteData.childNotes && noteData.childNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Child Notes ({noteData.childNotes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {noteData.childNotes.map((child) => (
                <li key={child.id}>
                  <Link
                    href={`/dashboard/notes/${child.id}`}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {child.title || "Untitled Note"}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Attachments Section */}
      <AttachmentsSection entityType="note" entityId={id} initialAttachments={attachments} />

      {/* Links Section */}
      <EntityLinksSection entityType="note" entityId={id} initialLinks={links} />

      {/* Comments Section */}
      <CommentThread
        entityType="note"
        entityId={id}
        currentUserId={session.user.id}
        initialComments={commentsData.comments}
      />
    </div>
  );
}
