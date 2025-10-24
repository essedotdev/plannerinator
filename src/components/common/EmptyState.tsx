import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /** Icon to display (from lucide-react) */
  icon: LucideIcon;
  /** Main heading text */
  title: string;
  /** Description text */
  description: string;
  /** Optional action button or link */
  action?: React.ReactNode;
}

/**
 * EmptyState component for consistent empty state UI across the application.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={FileX}
 *   title="No tasks found"
 *   description="Create your first task to get started"
 *   action={
 *     <Button asChild>
 *       <Link href="/dashboard/tasks/new">
 *         <Plus className="h-4 w-4 mr-2" />
 *         Create Task
 *       </Link>
 *     </Button>
 *   }
 * />
 * ```
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
