import Link from "next/link";
import { Plus, FolderX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common";
import { ProjectCard } from "./ProjectCard";

/**
 * Project List Component
 *
 * Displays a list of projects in a grid layout
 * Shows empty state when no projects exist
 */

interface ProjectListProps {
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    status: "active" | "on_hold" | "completed" | "archived" | "cancelled";
    color: string | null;
    icon: string | null;
    startDate: Date | string | null;
    endDate: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  }>;
}

export function ProjectList({ projects }: ProjectListProps) {
  // Empty state
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderX}
        title="No projects found"
        description="Create your first project to organize your work"
        action={
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
