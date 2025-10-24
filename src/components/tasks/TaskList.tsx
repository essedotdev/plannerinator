import Link from "next/link";
import { Plus, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    status: "todo" | "in_progress" | "done" | "cancelled";
    priority: "low" | "medium" | "high" | "urgent" | null;
    project?: {
      id: string;
      name: string;
      color: string | null;
    } | null;
  }>;
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No tasks found"
        description="Create your first task to get started and stay organized"
        action={
          <Button asChild>
            <Link href="/dashboard/tasks/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
