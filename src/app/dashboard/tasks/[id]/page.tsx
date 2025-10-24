import { getTaskById } from "@/features/tasks/queries";
import { getEntityTags } from "@/features/tags/queries";
import { getEntityComments } from "@/features/comments/queries";
import { getEntityLinks } from "@/features/links/queries";
import { getAttachmentsByEntity } from "@/features/attachments/queries";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TagInput } from "@/components/tags/TagInput";
import { CommentThread } from "@/components/comments/CommentThread";
import { EntityLinksSection } from "@/components/links/EntityLinksSection";
import { AttachmentsSection } from "@/components/attachments/AttachmentsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import Link from "next/link";
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

  // Fetch tags, comments, links, and attachments in parallel
  const [tags, commentsData, links, attachments] = await Promise.all([
    getEntityTags({ entityType: "task", entityId: id }),
    getEntityComments({ entityType: "task", entityId: id }),
    getEntityLinks({ entityType: "task", entityId: id }),
    getAttachmentsByEntity("task", id),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title="Task Details" description={`Viewing task: ${taskData.title}`} backButton />

      {/* Edit Form */}
      <TaskForm mode="edit" initialData={taskData} />

      {/* Tags and Parent Task - Side by side */}
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
            <TagInput entityType="task" entityId={id} initialTags={tags} />
          </CardContent>
        </Card>

        {/* Parent Task Card */}
        {taskData.parentTask && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parent Task</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/dashboard/tasks/${taskData.parentTask.id}`}
                className="block hover:text-primary transition-colors"
              >
                <p className="font-medium">{taskData.parentTask.title}</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {TASK_STATUS_LABELS[taskData.parentTask.status]}
                </Badge>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Subtasks Card */}
      {taskData.subtasks && taskData.subtasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subtasks ({taskData.subtasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {taskData.subtasks.map((subtask) => (
                <li key={subtask.id}>
                  <Link
                    href={`/dashboard/tasks/${subtask.id}`}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Badge variant="outline" className="text-xs">
                      {TASK_STATUS_LABELS[subtask.status]}
                    </Badge>
                    <span className="text-sm">{subtask.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Attachments Section */}
      <AttachmentsSection entityType="task" entityId={id} initialAttachments={attachments} />

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
