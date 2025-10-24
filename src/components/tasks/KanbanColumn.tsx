"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KanbanCard } from "./KanbanCard";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

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

interface KanbanColumnProps {
  title: string;
  status: "todo" | "in_progress" | "done";
  tasks: Task[];
  icon?: React.ReactNode;
}

/**
 * KanbanColumn Component
 *
 * Column in Kanban board:
 * - Header with title and count
 * - Droppable area for cards
 * - Sortable context for reordering
 */
export function KanbanColumn({ title, status, tasks, icon }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const taskIds = tasks.map((task) => task.id);

  return (
    <Card className={`flex flex-col ${isOver ? "ring-2 ring-primary" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">
        <div ref={setNodeRef} className="space-y-3 min-h-[200px]">
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                No tasks in this column
              </div>
            ) : (
              tasks.map((task) => <KanbanCard key={task.id} task={task} />)
            )}
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  );
}
