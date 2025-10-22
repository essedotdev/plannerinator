import { getNoteById } from "@/features/notes/queries";
import { getEntityTags } from "@/features/tags/queries";
import { getEntityComments } from "@/features/comments/queries";
import { getEntityLinks } from "@/features/links/queries";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common";
import { NoteForm } from "@/components/notes/NoteForm";
import { TagInput } from "@/components/tags/TagInput";
import { CommentThread } from "@/components/comments/CommentThread";
import { EntityLinksSection } from "@/components/links/EntityLinksSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, FileText, Star } from "lucide-react";
import { NOTE_TYPE_LABELS } from "@/lib/labels";

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

  // Fetch tags, comments, and links in parallel
  const [tags, commentsData, links] = await Promise.all([
    getEntityTags({ entityType: "note", entityId: id }),
    getEntityComments({ entityType: "note", entityId: id }),
    getEntityLinks({ entityType: "note", entityId: id }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Note Details"
        description={noteData.title ? `Viewing note: ${noteData.title}` : "Viewing note"}
      />

      {/* Edit Form */}
      <NoteForm mode="edit" initialData={noteData} />

      {/* Additional Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Note Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Project */}
          {noteData.project && (
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Project</p>
                <p className="font-medium">{noteData.project.name}</p>
              </div>
            </div>
          )}

          {/* Type */}
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <Badge variant="outline">{NOTE_TYPE_LABELS[noteData.type]}</Badge>
            </div>
          </div>

          {/* Favorite */}
          {noteData.isFavorite && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <p className="font-medium">Favorite</p>
            </div>
          )}

          {/* Parent Note */}
          {noteData.parentNote && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Parent Note</p>
              <p className="font-medium">{noteData.parentNote.title || "Untitled Note"}</p>
            </div>
          )}

          {/* Child Notes */}
          {noteData.childNotes && noteData.childNotes.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Child Notes ({noteData.childNotes.length})
              </p>
              <ul className="space-y-1">
                {noteData.childNotes.map((child) => (
                  <li key={child.id} className="text-sm">
                    {child.title || "Untitled Note"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <TagInput entityType="note" entityId={id} initialTags={tags} />
        </CardContent>
      </Card>

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
