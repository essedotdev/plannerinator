"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getProjects } from "@/features/projects/queries";
import type { Project } from "@/db/schema";

export type ProjectOption = Pick<Project, "id" | "name" | "icon" | "color" | "status">;

/**
 * Hook for loading and managing project selection in forms.
 *
 * This hook handles the common pattern of:
 * 1. Loading all projects on mount
 * 2. Managing loading state
 * 3. Handling errors with toast notifications
 *
 * Used in TaskForm, EventForm, and NoteForm for project selection.
 *
 * @returns Object containing projects array and loading state
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const { projects, loading } = useProjectSelection();
 *
 *   return (
 *     <Select disabled={loading}>
 *       {projects.map(project => (
 *         <SelectItem key={project.id} value={project.id}>
 *           {project.name}
 *         </SelectItem>
 *       ))}
 *     </Select>
 *   );
 * }
 * ```
 */
export function useProjectSelection() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const result = await getProjects({ sortBy: "name", sortOrder: "asc" });
        setProjects(result.projects);
      } catch (error) {
        console.error("Failed to load projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return { projects, loading };
}
