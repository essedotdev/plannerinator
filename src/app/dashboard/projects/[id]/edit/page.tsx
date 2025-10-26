import { notFound } from "next/navigation";
import { Tag } from "lucide-react";
import { PageHeader } from "@/components/common";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { TagInput } from "@/components/tags/TagInput";
import { CommentThread } from "@/components/comments/CommentThread";
import { EntityLinksSection } from "@/components/links/EntityLinksSection";
import { AttachmentsSection } from "@/components/attachments/AttachmentsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectById } from "@/features/projects/queries";
import { getEntityTags } from "@/features/tags/queries";
import { getEntityComments } from "@/features/comments/queries";
import { getEntityLinks } from "@/features/links/queries";
import { getAttachmentsByEntity } from "@/features/attachments/queries";
import { getSession } from "@/lib/auth";

/**
 * Edit Project Page
 *
 * Form to edit an existing project
 */

interface EditProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;

  // Fetch project
  let project;
  try {
    project = await getProjectById(id);
  } catch {
    notFound();
  }

  // Get current user session
  const session = await getSession();
  if (!session?.user) {
    notFound();
  }

  // Fetch tags, comments, links, and attachments in parallel
  const [tags, commentsData, links, attachments] = await Promise.all([
    getEntityTags({ entityType: "project", entityId: id }),
    getEntityComments({ entityType: "project", entityId: id }),
    getEntityLinks({ entityType: "project", entityId: id }),
    getAttachmentsByEntity("project", id),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Edit Project"
        description={`Update details for ${project.name}`}
        backButton
      />

      {/* Project Form */}
      <ProjectForm
        mode="edit"
        initialData={{
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          color: project.color,
          icon: project.icon,
          startDate: project.startDate ? new Date(project.startDate) : null,
          endDate: project.endDate ? new Date(project.endDate) : null,
        }}
      />

      {/* Tags Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TagInput entityType="project" entityId={id} initialTags={tags} />
        </CardContent>
      </Card>

      {/* Attachments Section */}
      <AttachmentsSection entityType="project" entityId={id} initialAttachments={attachments} />

      {/* Links Section */}
      <EntityLinksSection entityType="project" entityId={id} initialLinks={links} />

      {/* Comments Section */}
      <CommentThread
        entityType="project"
        entityId={id}
        currentUserId={session.user.id}
        initialComments={commentsData.comments}
      />
    </div>
  );
}
