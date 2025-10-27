import { notFound } from "next/navigation";
import Link from "next/link";
import { Tag } from "lucide-react";
import { PageHeader } from "@/components/common";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { TagInput } from "@/components/tags/TagInput";
import { CommentThread } from "@/components/comments/CommentThread";
import { EntityLinksSection } from "@/components/links/EntityLinksSection";
import { AttachmentsSection } from "@/components/attachments/AttachmentsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABELS } from "@/lib/labels";
import { getProjectById } from "@/features/projects/queries";
import { getEntityTags } from "@/features/tags/queries";
import { getEntityComments } from "@/features/comments/queries";
import { getEntityLinks } from "@/features/links/queries";
import { getAttachmentsByEntity } from "@/features/attachments/queries";
import { getSession } from "@/lib/auth";

/**
 * Project Detail Page
 *
 * Features:
 * - View project details
 * - Edit project
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
        title="Project Details"
        description={`Viewing project: ${project.name}`}
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
          parentProjectId: project.parentProjectId,
        }}
      />

      {/* Tags and Parent Project - Side by side */}
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
            <TagInput entityType="project" entityId={id} initialTags={tags} />
          </CardContent>
        </Card>

        {/* Parent Project Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parent Project</CardTitle>
          </CardHeader>
          <CardContent>
            {project.parentProject ? (
              <Link
                href={`/dashboard/projects/${project.parentProject.id}`}
                className="block hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-2">
                  {project.parentProject.icon && <span>{project.parentProject.icon}</span>}
                  <p className="font-medium">{project.parentProject.name}</p>
                </div>
                <Badge variant="outline" className="mt-2 text-xs">
                  {PROJECT_STATUS_LABELS[project.parentProject.status]}
                </Badge>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">No parent project</p>
            )}
          </CardContent>
        </Card>
      </div>

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
