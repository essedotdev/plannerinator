"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createProject, updateProject } from "@/features/projects/actions";
import { createProjectSchema, updateProjectSchema } from "@/features/projects/schema";
import { getProjectsForParentSelection } from "@/features/projects/parent-actions";
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
import { formatForDateInput } from "@/lib/dates";
import { PROJECT_STATUS_LABELS } from "@/lib/labels";
import { useEffect } from "react";
import type { Project } from "@/db/schema";

type ProjectOption = Pick<Project, "id" | "name" | "icon" | "status">;

interface ProjectFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
    status?: "active" | "on_hold" | "completed" | "archived" | "cancelled";
    color?: string | null;
    icon?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    parentProjectId?: string | null;
  };
}

export function ProjectForm({ mode, initialData }: ProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const { register, handleSubmit, formState, watch, setValue } = useForm({
    resolver: zodResolver(mode === "edit" ? updateProjectSchema : createProjectSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || undefined,
      icon: initialData?.icon || undefined,
      color: initialData?.color || undefined,
      ...(mode === "edit" && { status: initialData?.status || "active" }),
      startDate: initialData?.startDate ? formatForDateInput(initialData.startDate) : undefined,
      endDate: initialData?.endDate ? formatForDateInput(initialData.endDate) : undefined,
      parentProjectId: initialData?.parentProjectId || undefined,
    },
  });

  // Load all projects (exclude current project in edit mode)
  useEffect(() => {
    async function loadProjects() {
      try {
        const result = await getProjectsForParentSelection(
          mode === "edit" ? initialData?.id : undefined
        );
        if (result.success) {
          setProjects(result.projects);
        } else {
          toast.error("Failed to load projects");
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setLoadingProjects(false);
      }
    }
    loadProjects();
  }, [mode, initialData?.id]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await createProject(data);
        toast.success("Project created successfully!");
        router.push("/dashboard/projects");
      } else if (initialData?.id) {
        await updateProject(initialData.id, data);
        toast.success("Project updated successfully!");
        router.push(`/dashboard/projects/${initialData.id}`);
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save project");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Project" : "Edit Project"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter project name"
              disabled={isSubmitting}
            />
            {formState.errors.name && (
              <p className="text-sm text-destructive">{formState.errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the project"
              rows={4}
              disabled={isSubmitting}
            />
            {formState.errors.description && (
              <p className="text-sm text-destructive">{formState.errors.description.message}</p>
            )}
          </div>

          {/* Parent Project & Status */}
          <div className={`grid gap-4 ${mode === "edit" ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
            {/* Parent Project Selection */}
            <div className="space-y-2">
              <Label htmlFor="parentProject">Parent Project</Label>
              <Select
                value={watch("parentProjectId") || undefined}
                onValueChange={(value) =>
                  setValue("parentProjectId", value || undefined, { shouldValidate: true })
                }
                disabled={isSubmitting || loadingProjects}
              >
                <SelectTrigger id="parentProject" className="w-full">
                  <SelectValue placeholder={loadingProjects ? "Loading..." : "No parent project"} />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <span className="flex items-center gap-2">
                        {project.icon && <span>{project.icon}</span>}
                        <span className="flex-1 truncate">{project.name}</span>
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
              {watch("parentProjectId") && (
                <button
                  type="button"
                  onClick={() => setValue("parentProjectId", undefined, { shouldValidate: true })}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status - Only in Edit Mode */}
            {mode === "edit" && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch("status") || "active"}
                  onValueChange={(value) =>
                    setValue(
                      "status",
                      value as "active" | "on_hold" | "completed" | "archived" | "cancelled"
                    )
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{PROJECT_STATUS_LABELS.active}</SelectItem>
                    <SelectItem value="on_hold">{PROJECT_STATUS_LABELS.on_hold}</SelectItem>
                    <SelectItem value="completed">{PROJECT_STATUS_LABELS.completed}</SelectItem>
                    <SelectItem value="archived">{PROJECT_STATUS_LABELS.archived}</SelectItem>
                    <SelectItem value="cancelled">{PROJECT_STATUS_LABELS.cancelled}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Icon & Color */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Icon */}
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input
                id="icon"
                {...register("icon")}
                placeholder="📁"
                disabled={isSubmitting}
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Add an emoji to represent this project
              </p>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                {...register("color")}
                disabled={isSubmitting}
                className="h-10 w-full"
              />
              <p className="text-xs text-muted-foreground">
                Project color for badges and UI elements
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                disabled={isSubmitting}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" {...register("endDate")} disabled={isSubmitting} />
              {formState.errors.endDate && (
                <p className="text-sm text-destructive">{formState.errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
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
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Project" : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
