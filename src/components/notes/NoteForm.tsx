"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createNote, updateNote } from "@/features/notes/actions";
import { createNoteSchema } from "@/features/notes/schema";
import { getProjects } from "@/features/projects/queries";
import { PROJECT_STATUS_LABELS } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownEditor } from "./MarkdownEditor";
import type { Project } from "@/db/schema";

type ProjectOption = Pick<Project, "id" | "name" | "icon" | "color" | "status">;

interface NoteFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title?: string | null;
    content?: string | null;
    projectId?: string | null;
    parentNoteId?: string | null;
    project?: {
      id: string;
      name: string;
      icon?: string | null;
      color?: string | null;
      status: string;
    } | null;
  };
}

export function NoteForm({ mode, initialData }: NoteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const { register, handleSubmit, formState, watch, setValue } = useForm({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      projectId: initialData?.projectId || undefined,
      parentNoteId: initialData?.parentNoteId || undefined,
    },
  });

  // Register content field manually since we're using a custom component
  useEffect(() => {
    register("content");
  }, [register]);

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
        const result = await createNote(data);
        if (!result.success) {
          throw new Error("Failed to create note");
        }
        toast.success("Note created successfully!");
        router.push("/dashboard/notes");
      } else if (initialData?.id) {
        const result = await updateNote(initialData.id, data);
        if (!result.success) {
          throw new Error("Failed to update note");
        }
        toast.success("Note updated successfully!");
        router.push(`/dashboard/notes/${initialData.id}`);
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save note");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Note" : "Edit Note"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter note title"
              disabled={isSubmitting}
            />
            {formState.errors.title && (
              <p className="text-sm text-destructive">{formState.errors.title.message}</p>
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

          {/* Content - Markdown Editor */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <MarkdownEditor
              value={watch("content") || ""}
              onChange={(value) =>
                setValue("content", value, { shouldValidate: true, shouldDirty: true })
              }
              placeholder="Write your note in markdown..."
              minHeight="400px"
            />
            {formState.errors.content && (
              <p className="text-sm text-destructive">{formState.errors.content.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Note" : "Update Note"}
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
