import { getTaskById } from "@/features/tasks/queries";
import { getEntityTags } from "@/features/tags/queries";
import { getEntityComments } from "@/features/comments/queries";
import { getEntityLinks } from "@/features/links/queries";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TagInput } from "@/components/tags/TagInput";
import { CommentThread } from "@/components/comments/CommentThread";
import { EntityLinksSection } from "@/components/links/EntityLinksSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FolderOpen } from "lucide-react";
import { formatDateTime } from "@/lib/dates";
import { TASK_STATUS_LABELS } from "@/lib/labels";

/**
 * Task detail page
 *
 * Features:
 * - View task details
 * - Edit task
 * - View related project
 * - View subtasks
 */

interface TaskDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;

  const taskData = await getTaskById(id);

  if (!taskData) {
    notFound();
  }

  // Get current user session
  const session = await getSession();
  if (!session?.user) {
    notFound();
  }

  // Fetch tags, comments, and links in parallel
  const [tags, commentsData, links] = await Promise.all([
    getEntityTags({ entityType: "task", entityId: id }),
    getEntityComments({ entityType: "task", entityId: id }),
    getEntityLinks({ entityType: "task", entityId: id }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title="Task Details" description={`Viewing task: ${taskData.title}`} />

      {/* Edit Form */}
      <TaskForm mode="edit" initialData={taskData} />

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metadata Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {taskData.project && (
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-medium">{taskData.project.name}</p>
                </div>
              </div>
            )}

            {taskData.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{formatDateTime(taskData.dueDate)}</p>
                </div>
              </div>
            )}

            {taskData.duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{taskData.duration} minutes</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-2">Status</p>
              <Badge>{TASK_STATUS_LABELS[taskData.status]}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tags Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <TagInput entityType="task" entityId={id} initialTags={tags} />
          </CardContent>
        </Card>

        {/* Subtasks Card */}
        {taskData.subtasks && taskData.subtasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subtasks ({taskData.subtasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {taskData.subtasks.map((subtask) => (
                  <li key={subtask.id} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {TASK_STATUS_LABELS[subtask.status]}
                    </Badge>
                    <span className="text-sm">{subtask.title}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Parent Task Card */}
        {taskData.parentTask && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parent Task</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{taskData.parentTask.title}</p>
              <Badge variant="outline" className="mt-2 text-xs">
                {TASK_STATUS_LABELS[taskData.parentTask.status]}
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Links Section */}
      <EntityLinksSection entityType="task" entityId={id} initialLinks={links} />

      {/* Comments Section */}
      <CommentThread
        entityType="task"
        entityId={id}
        currentUserId={session.user.id}
        initialComments={commentsData.comments}
      />
    </div>
  );
}
