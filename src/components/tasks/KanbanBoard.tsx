"use client";

import { useState } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from "@dnd-kit/core";
import { Circle, Clock, CheckCircle2 } from "lucide-react";
import { updateTaskStatus } from "@/features/tasks/actions";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent" | null;
  dueDate: Date | null;
  project?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
}

interface KanbanBoardProps {
  tasks: Task[];
}

/**
 * KanbanBoard Component
 *
 * Kanban board with drag & drop:
 * - Three columns: To Do, In Progress, Done
 * - Drag tasks between columns to update status
 * - Optimistic UI updates
 */
export function KanbanBoard({ tasks: initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Filter tasks by status (excluding cancelled)
  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const doneTasks = tasks.filter((task) => task.status === "done");

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;

    // Check if we're dropping over a column (status) or over a task
    let newStatus: "todo" | "in_progress" | "done" | "cancelled";

    // If over.id is a valid status, use it directly
    if (over.id === "todo" || over.id === "in_progress" || over.id === "done") {
      newStatus = over.id;
    } else {
      // Otherwise, we're dropping over a task, find its status
      const overTask = tasks.find((t) => t.id === over.id);
      if (!overTask) return;
      newStatus = overTask.status;
    }

    // Find the task
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    const oldStatus = task.status;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

    // Server update
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success(
        `Task moved to ${newStatus === "in_progress" ? "In Progress" : newStatus === "done" ? "Done" : "To Do"}`
      );
    } catch (error) {
      // Revert on error
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: oldStatus } : t)));
      toast.error("Failed to update task status");
      console.error("Error updating task status:", error);
    }
  };

  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* To Do Column */}
        <KanbanColumn
          title="To Do"
          status="todo"
          tasks={todoTasks}
          icon={<Circle className="h-4 w-4" />}
        />

        {/* In Progress Column */}
        <KanbanColumn
          title="In Progress"
          status="in_progress"
          tasks={inProgressTasks}
          icon={<Clock className="h-4 w-4" />}
        />

        {/* Done Column */}
        <KanbanColumn
          title="Done"
          status="done"
          tasks={doneTasks}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-50">
            <div className="p-3 bg-card border rounded-lg shadow-lg">
              <p className="font-medium text-sm">{activeTask.title}</p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
