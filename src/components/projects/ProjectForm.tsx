"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createProject, updateProject } from "@/features/projects/actions";
import { createProjectSchema } from "@/features/projects/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatForDateInput } from "@/lib/dates";

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
  };
}

export function ProjectForm({ mode, initialData }: ProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || undefined,
      icon: initialData?.icon || undefined,
      startDate: initialData?.startDate ? formatForDateInput(initialData.startDate) : undefined,
      endDate: initialData?.endDate ? formatForDateInput(initialData.endDate) : undefined,
    },
  });

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
              <Label>Color (optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Project color badge (defaults to blue)
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
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Project" : "Update Project"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
