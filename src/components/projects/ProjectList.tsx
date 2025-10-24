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
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function ProjectList({ projects, pagination }: ProjectListProps) {
  // Empty state
  if (projects.length === 0) {
    const hasFilters = pagination && pagination.total > 0;

    return (
      <EmptyState
        icon={FolderX}
        title="No projects found"
        description={
          hasFilters
            ? "Try adjusting your filters to see more projects"
            : "Create your first project to organize your work"
        }
        action={
          !hasFilters ? (
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      {pagination && (
        <div className="text-sm text-muted-foreground">
          Showing {pagination.offset + 1} -{" "}
          {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}{" "}
          projects
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
