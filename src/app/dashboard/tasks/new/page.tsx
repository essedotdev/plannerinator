import { PageHeader } from "@/components/common";
import { TaskForm } from "@/components/tasks/TaskForm";

/**
 * Create new task page
 */
export default function NewTaskPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Task" description="Create a new task to track your work" />
      <TaskForm mode="create" />
    </div>
  );
}
