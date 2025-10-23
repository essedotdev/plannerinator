"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createTask, updateTask } from "@/features/tasks/actions";
import { createTaskSchema, type TaskPriority } from "@/features/tasks/schema";
import { getProjects } from "@/features/projects/queries";
import { PROJECT_STATUS_LABELS } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "@/db/schema";

type ProjectOption = Pick<Project, "id" | "name" | "icon" | "color" | "status">;

interface TaskFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    description?: string | null;
    dueDate?: Date | null;
    startDate?: Date | null;
    duration?: number | null;
    status: "todo" | "in_progress" | "done" | "cancelled";
    priority?: "low" | "medium" | "high" | "urgent" | null;
    projectId?: string | null;
    project?: {
      id: string;
      name: string;
      icon?: string | null;
      color?: string | null;
      status: string;
    } | null;
  };
}

export function TaskForm({ mode, initialData }: TaskFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const { register, handleSubmit, formState, watch, setValue } = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      dueDate: initialData?.dueDate || undefined,
      startDate: initialData?.startDate || undefined,
      duration: initialData?.duration || undefined,
      priority: initialData?.priority || "medium",
      projectId: initialData?.projectId || undefined,
    },
  });

  // Load all projects (regardless of status)
  useEffect(() => {
    async function loadProjects() {
      try {
        const result = await getProjects({ sortBy: "name", sortOrder: "asc" });
        setProjects(result.projects);
      } catch (error) {
        console.error("Failed to load projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setLoadingProjects(false);
      }
    }
    loadProjects();
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await createTask(data);
        toast.success("Task created successfully!");
        router.push("/dashboard/tasks");
      } else if (initialData?.id) {
        await updateTask(initialData.id, data);
        toast.success("Task updated successfully!");
        router.push(`/dashboard/tasks/${initialData.id}`);
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Task" : "Edit Task"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter task title"
              disabled={isSubmitting}
            />
            {formState.errors.title && (
              <p className="text-sm text-destructive">{formState.errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Add more details about this task..."
              rows={4}
              disabled={isSubmitting}
            />
            {formState.errors.description && (
              <p className="text-sm text-destructive">{formState.errors.description.message}</p>
            )}
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">Project (optional)</Label>
            <Select
              value={watch("projectId") || undefined}
              onValueChange={(value) =>
                setValue("projectId", value || undefined, { shouldValidate: true })
              }
              disabled={isSubmitting || loadingProjects}
            >
              <SelectTrigger id="project">
                <SelectValue placeholder={loadingProjects ? "Loading..." : "No project selected"} />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <span className="flex items-center gap-2 w-full">
                      {project.icon && <span>{project.icon}</span>}
                      <span className="flex-1">{project.name}</span>
                      {project.status && project.status !== "active" && (
                        <span className="text-xs text-muted-foreground">
                          (
                          {
                            PROJECT_STATUS_LABELS[
                              project.status as keyof typeof PROJECT_STATUS_LABELS
                            ]
                          }
                          )
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {watch("projectId") && (
              <button
                type="button"
                onClick={() => setValue("projectId", undefined, { shouldValidate: true })}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear selection
              </button>
            )}
          </div>

          {/* Grid for smaller fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={watch("priority") || "medium"}
                onValueChange={(value) => setValue("priority", value as TaskPriority)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                {...register("duration", { valueAsNumber: true })}
                placeholder="e.g. 30"
                disabled={isSubmitting}
              />
              {formState.errors.duration && (
                <p className="text-sm text-destructive">{formState.errors.duration.message}</p>
              )}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...register("startDate")}
                disabled={isSubmitting}
              />
              {formState.errors.startDate && (
                <p className="text-sm text-destructive">{formState.errors.startDate.message}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                {...register("dueDate")}
                disabled={isSubmitting}
              />
              {formState.errors.dueDate && (
                <p className="text-sm text-destructive">{formState.errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Task" : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
