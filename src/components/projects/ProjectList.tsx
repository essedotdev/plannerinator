import { FileX } from "lucide-react";
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
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No projects found</h3>
        <p className="text-muted-foreground mt-2">
          {pagination && pagination.total > 0
            ? "Try adjusting your filters"
            : "Create your first project to get started"}
        </p>
      </div>
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
