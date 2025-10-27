"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle2,
  Copy,
  Archive,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  markTaskComplete,
  markTaskIncomplete,
  deleteTask,
  duplicateTask,
  archiveTask,
  restoreTask,
} from "@/features/tasks/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "@/lib/labels";
import { formatShortDate, isOverdue } from "@/lib/dates";
import { ConfirmDialog } from "@/components/common";

/**
 * Task priority colors
 */
const PRIORITY_COLORS = {
  low: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
  medium: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  high: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  urgent: "bg-red-500/10 text-red-700 dark:text-red-300",
} as const;

/**
 * Task status colors
 */
const STATUS_COLORS = {
  todo: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
  in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  done: "bg-green-500/10 text-green-700 dark:text-green-300",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-300",
} as const;

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    status: "todo" | "in_progress" | "done" | "cancelled";
    priority: "low" | "medium" | "high" | "urgent" | null;
    archivedAt?: Date | null;
    project?: {
      id: string;
      name: string;
      color: string | null;
    } | null;
  };
}

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(task.status === "done");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleToggleComplete = async () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);

    startTransition(async () => {
      try {
        if (newStatus) {
          await markTaskComplete(task.id);
          toast.success("Task completed!");
        } else {
          await markTaskIncomplete(task.id);
          toast.success("Task reopened");
        }
        router.refresh();
      } catch (error) {
        setIsCompleted(!newStatus); // Revert on error
        toast.error(error instanceof Error ? error.message : "Failed to update task");
      }
    });
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);

    startTransition(async () => {
      try {
        await deleteTask(task.id);
        toast.success("Task deleted");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete task");
      }
    });
  };

  const handleDuplicate = async () => {
    startTransition(async () => {
      try {
        const result = await duplicateTask(task.id);
        toast.success("Task duplicated");
        router.refresh();
        // Optionally navigate to the new task
        if (result.task) {
          router.push(`/dashboard/tasks/${result.task.id}`);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to duplicate task");
      }
    });
  };

  const handleArchive = async () => {
    startTransition(async () => {
      try {
        await archiveTask(task.id);
        toast.success("Task archived");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to archive task");
      }
    });
  };

  const handleRestore = async () => {
    startTransition(async () => {
      try {
        await restoreTask(task.id);
        toast.success("Task restored");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to restore task");
      }
    });
  };

  // Check if task is overdue
  const isTaskOverdue = task.dueDate && isOverdue(task.dueDate, task.status === "done");

  return (
    <Card className={isCompleted ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleToggleComplete}
            disabled={isPending}
            className="mt-1"
          />

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <Link href={`/dashboard/tasks/${task.id}`} className="group">
              <h3
                className={`font-medium hover:text-primary transition-colors ${
                  isCompleted ? "line-through" : ""
                }`}
              >
                {task.title}
              </h3>
            </Link>

            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {/* Status */}
              <Badge variant="outline" className={STATUS_COLORS[task.status]}>
                {TASK_STATUS_LABELS[task.status]}
              </Badge>

              {/* Priority */}
              {task.priority && (
                <Badge variant="outline" className={PRIORITY_COLORS[task.priority]}>
                  {TASK_PRIORITY_LABELS[task.priority]}
                </Badge>
              )}

              {/* Archived Badge */}
              {task.archivedAt && (
                <Badge
                  variant="outline"
                  className="bg-gray-500/10 text-gray-700 dark:text-gray-300"
                >
                  Archived
                </Badge>
              )}

              {/* Project */}
              {task.project && (
                <Badge variant="outline" style={{ borderColor: task.project.color || undefined }}>
                  {task.project.name}
                </Badge>
              )}

              {/* Due Date */}
              {task.dueDate && (
                <div
                  className={`flex items-center gap-1 text-xs ${
                    isTaskOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{formatShortDate(task.dueDate)}</span>
                  {isTaskOverdue && <span className="font-medium">(Overdue)</span>}
                </div>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/tasks/${task.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleComplete} disabled={isPending}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isCompleted ? "Mark Incomplete" : "Mark Complete"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate} disabled={isPending}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {task.archivedAt ? (
                <DropdownMenuItem onClick={handleRestore} disabled={isPending}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleArchive} disabled={isPending}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                disabled={isPending}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </Card>
  );
}
