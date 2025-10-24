"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Archive, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { deleteProject, archiveProject, completeProject } from "@/features/projects/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PROJECT_STATUS_LABELS } from "@/lib/labels";
import { formatShortDate, formatDueDate, getDueDateColorClass } from "@/lib/dates";

/**
 * Project status colors for badges
 */
const PROJECT_STATUS_COLORS = {
  active: "bg-green-500/10 text-green-700 dark:text-green-300",
  on_hold: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  completed: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  archived: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-300",
} as const;

interface ProjectCardProps {
  project: {
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
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${project.name}"? This will also delete all related tasks, events, and notes.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteProject(project.id);
        toast.success("Project deleted");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete project");
      }
    });
  };

  const handleArchive = async () => {
    startTransition(async () => {
      try {
        await archiveProject(project.id);
        toast.success("Project archived");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to archive project");
      }
    });
  };

  const handleComplete = async () => {
    startTransition(async () => {
      try {
        await completeProject(project.id);
        toast.success("Project marked as completed");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to complete project");
      }
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {/* Project Icon & Title */}
          <Link href={`/dashboard/projects/${project.id}`} className="flex-1 group">
            <div className="flex items-start gap-3">
              {project.icon && <span className="text-2xl flex-shrink-0">{project.icon}</span>}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
          </Link>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/projects/${project.id}`} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              {project.status === "active" && (
                <>
                  <DropdownMenuItem
                    onClick={handleComplete}
                    disabled={isPending}
                    className="cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleArchive}
                    disabled={isPending}
                    className="cursor-pointer"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isPending}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Status & Dates */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Badge */}
          <Badge
            variant="outline"
            className={PROJECT_STATUS_COLORS[project.status]}
            style={{
              borderColor: project.color || undefined,
            }}
          >
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>

          {/* Due Date */}
          {project.endDate && (
            <Badge variant="outline" className={getDueDateColorClass(project.endDate)}>
              {formatDueDate(project.endDate)}
            </Badge>
          )}

          {/* Start Date */}
          {project.startDate && (
            <span className="text-xs text-muted-foreground">
              Started {formatShortDate(project.startDate)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
