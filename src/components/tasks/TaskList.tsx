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
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No tasks found</p>
        <p className="text-sm text-muted-foreground mt-2">Create your first task to get started</p>
      </div>
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
