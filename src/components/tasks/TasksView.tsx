"use client";

import { useState } from "react";
import { TaskList } from "./TaskList";
import { KanbanBoard } from "./KanbanBoard";
import { Button } from "@/components/ui/button";
import { LayoutList, LayoutGrid } from "lucide-react";

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

interface TasksViewProps {
  tasks: Task[];
  defaultView?: "list" | "kanban";
}

/**
 * TasksView Component
 *
 * Toggle between List and Kanban view for tasks:
 * - List view: Traditional list with filters
 * - Kanban view: Board with drag & drop
 */
export function TasksView({ tasks, defaultView = "list" }: TasksViewProps) {
  const [view, setView] = useState<"list" | "kanban">(defaultView);

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={view === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("list")}
        >
          <LayoutList className="h-4 w-4 mr-2" />
          List
        </Button>
        <Button
          variant={view === "kanban" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("kanban")}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Kanban
        </Button>
      </div>

      {/* Render appropriate view */}
      {view === "list" ? <TaskList tasks={tasks} /> : <KanbanBoard tasks={tasks} />}
    </div>
  );
}
