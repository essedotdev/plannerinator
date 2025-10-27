import { notFound } from "next/navigation";
import Link from "next/link";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common";
import { getProjectById, getProjectStats } from "@/features/projects/queries";
import { getTasks } from "@/features/tasks/queries";
import { getEvents } from "@/features/events/queries";
import { getNotes } from "@/features/notes/queries";
import { getEntityTags } from "@/features/tags/queries";
import { getEntityComments } from "@/features/comments/queries";
import { getEntityLinks } from "@/features/links/queries";
import { getAttachmentsByEntity } from "@/features/attachments/queries";
import { getSession } from "@/lib/auth";
import { PROJECT_STATUS_LABELS } from "@/lib/labels";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";
import { ArchiveProjectButton } from "@/components/projects/ArchiveProjectButton";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";
import { formatFullDate } from "@/lib/dates";

/**
 * Project Detail Page
 *
 * Features:
 * - Project overview with stats
 * - Edit/delete actions
 * - Tabs for: Overview, Tasks, Events, Notes
 * - Tags, attachments, links, and comments sections
 * - Related entities filtered by project
 */

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
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

  // Fetch project stats
  const stats = await getProjectStats({ projectId: id });

  // Fetch related entities, tags, comments, links, and attachments in parallel
  const tasksPromise = getTasks({ projectId: id, limit: 100 });
  const eventsPromise = getEvents({ projectId: id, limit: 100 });
  const notesPromise = getNotes({ projectId: id, limit: 100 });
  const tagsPromise = getEntityTags({ entityType: "project", entityId: id });
  const commentsPromise = getEntityComments({ entityType: "project", entityId: id });
  const linksPromise = getEntityLinks({ entityType: "project", entityId: id });
  const attachmentsPromise = getAttachmentsByEntity("project", id);

  const [tasksData, eventsData, notesData, tags, commentsData, links, attachments] =
    await Promise.all([
      tasksPromise,
      eventsPromise,
      notesPromise,
      tagsPromise,
      commentsPromise,
      linksPromise,
      attachmentsPromise,
    ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`${project.icon ? project.icon + " " : ""}${project.name}`}
        description={project.description || undefined}
        backButton
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/projects/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <ArchiveProjectButton projectId={id} projectName={project.name} />
            <DeleteProjectButton projectId={id} projectName={project.name} />
          </>
        }
      />

      {/* Metadata */}
      <div className="flex items-center gap-2 -mt-2">
        <Badge
          variant="outline"
          style={{
            borderColor: project.color || undefined,
            color: project.color || undefined,
          }}
        >
          {PROJECT_STATUS_LABELS[project.status]}
        </Badge>

        {project.startDate && (
          <span className="text-sm text-muted-foreground">
            Started {formatFullDate(project.startDate)}
          </span>
        )}

        {project.endDate && (
          <span className="text-sm text-muted-foreground">
            • Due {formatFullDate(project.endDate)}
          </span>
        )}
      </div>

      {/* Project Detail View */}
      <ProjectDetailView
        projectId={id}
        counts={project.counts}
        stats={stats}
        tasks={tasksData.tasks}
        events={eventsData.events}
        notes={notesData.notes}
        tags={tags}
        comments={commentsData.comments}
        links={links}
        attachments={attachments}
        currentUserId={session.user.id}
      />
    </div>
  );
}
