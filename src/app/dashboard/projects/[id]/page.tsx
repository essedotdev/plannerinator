import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common";
import { getProjectById, getProjectStats } from "@/features/projects/queries";
import { getTasks } from "@/features/tasks/queries";
import { getEvents } from "@/features/events/queries";
import { getNotes } from "@/features/notes/queries";
import { getEntityTags } from "@/features/tags/queries";
import { getEntityComments } from "@/features/comments/queries";
import { getEntityLinks } from "@/features/links/queries";
import { getSession } from "@/lib/auth";
import { TaskList } from "@/components/tasks/TaskList";
import { EventList } from "@/components/events/EventList";
import { NoteList } from "@/components/notes/NoteList";
import { TagInput } from "@/components/tags/TagInput";
import { CommentThread } from "@/components/comments/CommentThread";
import { EntityLinksSection } from "@/components/links/EntityLinksSection";
import { PROJECT_STATUS_LABELS } from "@/lib/labels";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";
import { formatFullDate } from "@/lib/dates";

/**
 * Project Detail Page
 *
 * Features:
 * - Project overview with stats
 * - Edit/delete actions
 * - Tabs for: Overview, Tasks, Events, Notes
 * - Related entities filtered by project
 */

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function ProjectDetailPage({ params, searchParams }: ProjectDetailPageProps) {
  const { id } = await params;
  const { tab = "overview" } = await searchParams;

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

  // Fetch related entities, tags, comments, and links in parallel
  const tasksPromise = getTasks({ projectId: id, limit: 100 });
  const eventsPromise = getEvents({ projectId: id, limit: 100 });
  const notesPromise = getNotes({ projectId: id, limit: 100 });
  const tagsPromise = getEntityTags({ entityType: "project", entityId: id });
  const commentsPromise = getEntityComments({ entityType: "project", entityId: id });
  const linksPromise = getEntityLinks({ entityType: "project", entityId: id });

  const [tasksData, eventsData, notesData, tags, commentsData, links] = await Promise.all([
    tasksPromise,
    eventsPromise,
    notesPromise,
    tagsPromise,
    commentsPromise,
    linksPromise,
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

      {/* Tabs */}
      <Tabs defaultValue={tab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks{" "}
            <Badge variant="secondary" className="ml-2">
              {project.counts.tasks}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="events">
            Events{" "}
            <Badge variant="secondary" className="ml-2">
              {project.counts.events}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="notes">
            Notes{" "}
            <Badge variant="secondary" className="ml-2">
              {project.counts.notes}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Tasks */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Tasks</CardDescription>
                <CardTitle className="text-3xl">{stats.tasks.total}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {stats.tasks.completed} completed
                </div>
              </CardContent>
            </Card>

            {/* Completion Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completion Rate</CardDescription>
                <CardTitle className="text-3xl">{stats.tasks.completionPercentage}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${stats.tasks.completionPercentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Upcoming Events</CardDescription>
                <CardTitle className="text-3xl">{stats.upcomingEvents}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Scheduled from today onwards</div>
              </CardContent>
            </Card>

            {/* Total Notes */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Notes</CardDescription>
                <CardTitle className="text-3xl">{stats.notes}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Documentation and ideas</div>
              </CardContent>
            </Card>
          </div>

          {/* Task Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Task Breakdown</CardTitle>
              <CardDescription>Tasks by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">To Do</span>
                  <Badge variant="outline">{stats.tasks.byStatus.todo}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Progress</span>
                  <Badge variant="outline">{stats.tasks.byStatus.in_progress}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Done</span>
                  <Badge variant="outline">{stats.tasks.byStatus.done}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cancelled</span>
                  <Badge variant="outline">{stats.tasks.byStatus.cancelled}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Organize and categorize this project</CardDescription>
            </CardHeader>
            <CardContent>
              <TagInput entityType="project" entityId={id} initialTags={tags} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Suspense fallback={<div>Loading tasks...</div>}>
            <TaskList tasks={tasksData.tasks} />
          </Suspense>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Suspense fallback={<div>Loading events...</div>}>
            <EventList events={eventsData.events} />
          </Suspense>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Suspense fallback={<div>Loading notes...</div>}>
            <NoteList notes={notesData.notes} />
          </Suspense>
        </TabsContent>
      </Tabs>

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
