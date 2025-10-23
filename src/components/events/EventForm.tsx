"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createEvent, updateEvent } from "@/features/events/actions";
import { createEventSchema } from "@/features/events/schema";
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
import { formatForDateTimeInput } from "@/lib/dates";
import type { Project } from "@/db/schema";

type ProjectOption = Pick<Project, "id" | "name" | "icon" | "color" | "status">;

interface EventFormProps {
  mode: "create" | "edit";
  initialData?: {
    id?: string;
    title?: string;
    description?: string | null;
    startTime?: Date;
    endTime?: Date | null;
    location?: string | null;
    locationUrl?: string | null;
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

export function EventForm({ mode, initialData }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const { register, handleSubmit, formState, watch, setValue } = useForm({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || undefined,
      startTime: initialData?.startTime ? formatForDateTimeInput(initialData.startTime) : "",
      endTime: initialData?.endTime ? formatForDateTimeInput(initialData.endTime) : undefined,
      location: initialData?.location || undefined,
      locationUrl: initialData?.locationUrl || undefined,
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
        await createEvent(data);
        toast.success("Event created successfully!");
        router.push("/dashboard/events");
      } else if (initialData?.id) {
        await updateEvent(initialData.id, data);
        toast.success("Event updated successfully!");
        router.push(`/dashboard/events/${initialData.id}`);
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Event" : "Edit Event"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter event title"
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
              placeholder="Add event description"
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

          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="startTime">
              Start Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startTime"
              type="datetime-local"
              {...register("startTime")}
              disabled={isSubmitting}
            />
            {formState.errors.startTime && (
              <p className="text-sm text-destructive">{formState.errors.startTime.message}</p>
            )}
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              {...register("endTime")}
              disabled={isSubmitting}
            />
            {formState.errors.endTime && (
              <p className="text-sm text-destructive">{formState.errors.endTime.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="Event location"
              disabled={isSubmitting}
            />
            {formState.errors.location && (
              <p className="text-sm text-destructive">{formState.errors.location.message}</p>
            )}
          </div>

          {/* Location URL */}
          <div className="space-y-2">
            <Label htmlFor="locationUrl">Location URL</Label>
            <Input
              id="locationUrl"
              type="url"
              {...register("locationUrl")}
              placeholder="https://maps.google.com/..."
              disabled={isSubmitting}
            />
            {formState.errors.locationUrl && (
              <p className="text-sm text-destructive">{formState.errors.locationUrl.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Event" : "Update Event"}
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
