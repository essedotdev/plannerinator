"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_STATUS_LABELS } from "@/lib/labels";
import { getTasksForParentSelection } from "@/features/tasks/parent-actions";
import { updateTask } from "@/features/tasks/actions";
import type { Task } from "@/db/schema";

type TaskOption = Pick<Task, "id" | "title" | "status">;

interface ParentTaskCardProps {
  mode: "create" | "edit" | "view";
  taskId?: string; // Required for edit mode
  parentTask?: {
    id: string;
    title: string;
    status: "todo" | "in_progress" | "done" | "cancelled";
  } | null;
  onParentChange?: (parentId: string | undefined) => void; // For create mode
}

/**
 * ParentTaskCard Component
 *
 * Displays and manages parent task relationship across different modes:
 * - view: Read-only display of parent task as link
 * - edit: Allows changing parent task with immediate save
 * - create: Allows selecting parent task (value managed by parent component)
 */
export function ParentTaskCard({ mode, taskId, parentTask, onParentChange }: ParentTaskCardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(mode !== "view");
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(
    parentTask?.id || undefined
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Load available tasks for parent selection (edit and create modes)
  useEffect(() => {
    if (mode === "view") return;

    async function loadTasks() {
      try {
        const result = await getTasksForParentSelection(mode === "edit" ? taskId : undefined);
        if (result.success) {
          setTasks(result.tasks);
        } else {
          toast.error("Failed to load tasks");
        }
      } catch (error) {
        console.error("Failed to load tasks:", error);
        toast.error("Failed to load tasks");
      } finally {
        setLoadingTasks(false);
      }
    }
    loadTasks();
  }, [mode, taskId]);

  // Handle parent change in edit mode (immediate save)
  const handleParentChangeEdit = async (newParentId: string | undefined) => {
    if (mode !== "edit" || !taskId) return;

    setIsUpdating(true);
    try {
      await updateTask(taskId, { parentTaskId: newParentId || null });
      setSelectedParentId(newParentId);
      toast.success("Parent task updated");
      router.refresh();
    } catch {
      toast.error("Failed to update parent task");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle parent change in create mode (notify parent component)
  const handleParentChangeCreate = (newParentId: string | undefined) => {
    if (mode !== "create") return;
    setSelectedParentId(newParentId);
    onParentChange?.(newParentId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Parent Task</CardTitle>
      </CardHeader>
      <CardContent>
        {mode === "view" ? (
          // View mode: Read-only display
          parentTask ? (
            <Link
              href={`/dashboard/tasks/${parentTask.id}`}
              className="block hover:text-primary transition-colors"
            >
              <p className="font-medium">{parentTask.title}</p>
              <Badge variant="outline" className="mt-2 text-xs">
                {TASK_STATUS_LABELS[parentTask.status]}
              </Badge>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">No parent task</p>
          )
        ) : (
          // Edit/Create mode: Parent task selector
          <div className="space-y-2">
            <Select
              value={selectedParentId || "none"}
              onValueChange={(value) => {
                const newValue = value === "none" ? undefined : value;
                if (mode === "edit") {
                  handleParentChangeEdit(newValue);
                } else {
                  handleParentChangeCreate(newValue);
                }
              }}
              disabled={loadingTasks || isUpdating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingTasks ? "Loading..." : "No parent task"} />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)]">
                <SelectItem value="none">No parent task</SelectItem>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    <span className="flex items-center gap-2">
                      <span className="flex-1 truncate">{task.title}</span>
                      <span className="text-xs text-muted-foreground">
                        ({TASK_STATUS_LABELS[task.status]})
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
