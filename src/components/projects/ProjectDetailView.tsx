"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, CheckSquare, Calendar, FileText } from "lucide-react";
import { TaskList } from "@/components/tasks/TaskList";
import { EventList } from "@/components/events/EventList";
import { NoteList } from "@/components/notes/NoteList";
import { TagsCard } from "@/components/tags/TagsCard";
import { ParentEntityCard } from "@/components/common/ParentEntityCard";
import { parentProjectConfig } from "@/components/projects/parent-project-config";
import { CommentThread } from "@/components/comments/CommentThread";
import { EntityLinksSection } from "@/components/links/EntityLinksSection";
import { AttachmentsSection } from "@/components/attachments/AttachmentsSection";
import type { Tag as DbTag, Comment, Link, Attachment } from "@/db/schema";

type ViewMode = "overview" | "tasks" | "events" | "notes";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent" | null;
  dueDate: Date | null;
  completedAt: Date | null;
  parentTaskId: string | null;
  project?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date | null;
  allDay: boolean;
  location: string | null;
  calendarType: "personal" | "work" | "family" | "other";
  project?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
}

interface Note {
  id: string;
  title: string | null;
  content: string | null;
  type: "note" | "document" | "research" | "idea" | "snippet";
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  project?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
}

interface ProjectStats {
  tasks: {
    total: number;
    completed: number;
    completionPercentage: number;
    byStatus: {
      todo: number;
      in_progress: number;
      done: number;
      cancelled: number;
    };
  };
  upcomingEvents: number;
  notes: number;
}

interface ProjectCounts {
  tasks: number;
  events: number;
  notes: number;
}

interface ProjectDetailViewProps {
  projectId: string;
  counts: ProjectCounts;
  stats: ProjectStats;
  tasks: Task[];
  events: Event[];
  notes: Note[];
  tags: DbTag[];
  comments: Array<{
    comment: Comment;
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  }>;
  links: Array<
    Link & {
      fromEntity: { type: "task" | "event" | "note" | "project"; id: string; title: string } | null;
      toEntity: { type: "task" | "event" | "note" | "project"; id: string; title: string } | null;
    }
  >;
  attachments: Attachment[];
  currentUserId: string;
  parentProject?: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    status: "active" | "on_hold" | "completed" | "archived" | "cancelled";
  } | null;
  defaultView?: ViewMode;
}

export function ProjectDetailView({
  projectId,
  counts,
  stats,
  tasks,
  events,
  notes,
  tags,
  comments,
  links,
  attachments,
  currentUserId,
  parentProject,
  defaultView = "overview",
}: ProjectDetailViewProps) {
  const [view, setView] = useState<ViewMode>(defaultView);

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="inline-flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
        <Button
          variant={view === "overview" ? "default" : "ghost"}
          size="sm"
          onClick={() => setView("overview")}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={view === "tasks" ? "default" : "ghost"}
          size="sm"
          onClick={() => setView("tasks")}
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Tasks
          <Badge variant="secondary" className="ml-2">
            {counts.tasks}
          </Badge>
        </Button>
        <Button
          variant={view === "events" ? "default" : "ghost"}
          size="sm"
          onClick={() => setView("events")}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Events
          <Badge variant="secondary" className="ml-2">
            {counts.events}
          </Badge>
        </Button>
        <Button
          variant={view === "notes" ? "default" : "ghost"}
          size="sm"
          onClick={() => setView("notes")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Notes
          <Badge variant="secondary" className="ml-2">
            {counts.notes}
          </Badge>
        </Button>
      </div>

      {/* Overview */}
      {view === "overview" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Tasks */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Tasks</CardDescription>
                <CardTitle className="text-3xl">{stats.tasks.total}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {stats.tasks.completed} completed
                </div>
              </CardContent>
            </Card>

            {/* Completion Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completion Rate</CardDescription>
                <CardTitle className="text-3xl">{stats.tasks.completionPercentage}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${stats.tasks.completionPercentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Upcoming Events</CardDescription>
                <CardTitle className="text-3xl">{stats.upcomingEvents}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Scheduled from today onwards</div>
              </CardContent>
            </Card>

            {/* Total Notes */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Notes</CardDescription>
                <CardTitle className="text-3xl">{stats.notes}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Documentation and ideas</div>
              </CardContent>
            </Card>
          </div>

          {/* Task Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Task Breakdown</CardTitle>
              <CardDescription>Tasks by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">To Do</span>
                  <Badge variant="outline">{stats.tasks.byStatus.todo}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Progress</span>
                  <Badge variant="outline">{stats.tasks.byStatus.in_progress}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Done</span>
                  <Badge variant="outline">{stats.tasks.byStatus.done}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cancelled</span>
                  <Badge variant="outline">{stats.tasks.byStatus.cancelled}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags and Parent - Read-only in view mode */}
          <TagsCard mode="view" entityType="project" initialTags={tags} />
          <ParentEntityCard mode="view" config={parentProjectConfig} parentEntity={parentProject} />

          {/* Attachments Section */}
          <AttachmentsSection
            entityType="project"
            entityId={projectId}
            initialAttachments={attachments}
          />

          {/* Links Section */}
          <EntityLinksSection entityType="project" entityId={projectId} initialLinks={links} />

          {/* Comments Section */}
          <CommentThread
            entityType="project"
            entityId={projectId}
            currentUserId={currentUserId}
            initialComments={comments}
          />
        </div>
      )}

      {/* Tasks */}
      {view === "tasks" && <TaskList tasks={tasks} />}

      {/* Events */}
      {view === "events" && <EventList events={events} />}

      {/* Notes */}
      {view === "notes" && <NoteList notes={notes} />}
    </div>
  );
}
