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
import { PROJECT_STATUS_LABELS } from "@/lib/labels";
import { getProjectsForParentSelection } from "@/features/projects/parent-actions";
import { updateProject } from "@/features/projects/actions";
import type { Project } from "@/db/schema";

type ProjectOption = Pick<Project, "id" | "name" | "icon" | "status">;

interface ParentProjectCardProps {
  mode: "create" | "edit" | "view";
  projectId?: string; // Required for edit mode
  parentProject?: {
    id: string;
    name: string;
    icon?: string | null;
    status: "active" | "on_hold" | "completed" | "archived" | "cancelled";
  } | null;
  onParentChange?: (parentId: string | undefined) => void; // For create mode
}

/**
 * ParentProjectCard Component
 *
 * Displays and manages parent project relationship across different modes:
 * - view: Read-only display of parent project as link
 * - edit: Allows changing parent project with immediate save
 * - create: Allows selecting parent project (value managed by parent component)
 */
export function ParentProjectCard({
  mode,
  projectId,
  parentProject,
  onParentChange,
}: ParentProjectCardProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(mode !== "view");
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(
    parentProject?.id || undefined
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Load available projects for parent selection (edit and create modes)
  useEffect(() => {
    if (mode === "view") return;

    async function loadProjects() {
      try {
        const result = await getProjectsForParentSelection(mode === "edit" ? projectId : undefined);
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
  }, [mode, projectId]);

  // Handle parent change in edit mode (immediate save)
  const handleParentChangeEdit = async (newParentId: string | undefined) => {
    if (mode !== "edit" || !projectId) return;

    setIsUpdating(true);
    try {
      await updateProject(projectId, { parentProjectId: newParentId || null });
      setSelectedParentId(newParentId);
      toast.success("Parent project updated");
      router.refresh();
    } catch {
      toast.error("Failed to update parent project");
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
        <CardTitle className="text-base">Parent Project</CardTitle>
      </CardHeader>
      <CardContent>
        {mode === "view" ? (
          // View mode: Read-only display
          parentProject ? (
            <Link
              href={`/dashboard/projects/${parentProject.id}`}
              className="block hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-2">
                {parentProject.icon && <span className="text-xl">{parentProject.icon}</span>}
                <p className="font-medium">{parentProject.name}</p>
              </div>
              <Badge variant="outline" className="mt-2 text-xs">
                {PROJECT_STATUS_LABELS[parentProject.status]}
              </Badge>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">No parent project</p>
          )
        ) : (
          // Edit/Create mode: Parent project selector
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
              disabled={loadingProjects || isUpdating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingProjects ? "Loading..." : "No parent project"} />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)]">
                <SelectItem value="none">No parent project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <span className="flex items-center gap-2">
                      {project.icon && <span>{project.icon}</span>}
                      <span className="flex-1 truncate">{project.name}</span>
                      {project.status && project.status !== "active" && (
                        <span className="text-xs text-muted-foreground">
                          ({PROJECT_STATUS_LABELS[project.status]})
                        </span>
                      )}
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
