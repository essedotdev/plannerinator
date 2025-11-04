"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

/**
 * Configuration for entity-specific behavior
 */
const ENTITY_CONFIG = {
  task: { singular: "Task", plural: "tasks", titleProp: "title" },
  event: { singular: "Event", plural: "events", titleProp: "title" },
  note: { singular: "Note", plural: "notes", titleProp: "title" },
  project: { singular: "Project", plural: "projects", titleProp: "name" },
} as const;

type EntityType = keyof typeof ENTITY_CONFIG;
type ActionType = "delete" | "archive";

interface EntityActionButtonProps {
  /**
   * The type of entity (task, event, note, project)
   */
  entityType: EntityType;

  /**
   * The ID of the entity to perform the action on
   */
  entityId: string;

  /**
   * The title/name of the entity for display in the confirmation dialog
   */
  entityTitle: string;

  /**
   * The action to perform (delete or archive)
   */
  actionType: ActionType;

  /**
   * The server action function to call
   */
  onAction: (id: string) => Promise<{ success: true } | void>;

  /**
   * Optional custom redirect path after successful action
   * Defaults to /dashboard/{entityTypePlural}
   */
  redirectPath?: string;
}

/**
 * Generic entity action button component for delete and archive operations.
 *
 * This component provides a consistent UX for destructive actions across all entity types.
 * It handles:
 * - Confirmation dialog with entity-specific messaging
 * - Loading states during async operations
 * - Error handling with toast notifications
 * - Automatic redirect after successful action
 *
 * @example
 * ```tsx
 * <EntityActionButton
 *   entityType="task"
 *   entityId={task.id}
 *   entityTitle={task.title}
 *   actionType="delete"
 *   onAction={deleteTask}
 * />
 * ```
 */
export function EntityActionButton({
  entityType,
  entityId,
  entityTitle,
  actionType,
  onAction,
  redirectPath,
}: EntityActionButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const config = ENTITY_CONFIG[entityType];
  const isDelete = actionType === "delete";

  // Dynamic text and icon configuration
  const Icon = isDelete ? Trash2 : Archive;
  const actionVerb = isDelete ? "Delete" : "Archive";
  const actionVerbLower = actionVerb.toLowerCase();
  const actionVerbPast = isDelete ? "deleted" : "archived";
  const defaultRedirect = redirectPath || `/dashboard/${config.plural}`;

  const handleAction = () => {
    startTransition(async () => {
      try {
        await onAction(entityId);
        toast.success(`${config.singular} ${actionVerbPast} successfully`);
        router.push(defaultRedirect);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Failed to ${actionVerbLower} ${config.singular.toLowerCase()}`
        );
        setIsOpen(false);
      }
    });
  };

  // Special message for archiving projects (cascade warning)
  const getDescription = () => {
    if (actionType === "archive" && entityType === "project") {
      return (
        <>
          Are you sure you want to archive <strong>&quot;{entityTitle}&quot;</strong>?
          <br />
          <br />
          This will archive the project and all associated tasks, events, and notes.
          <br />
          <br />
          You can restore it later from the trash.
        </>
      );
    }

    return (
      <>
        Are you sure you want to {actionVerbLower} <strong>&quot;{entityTitle}&quot;</strong>?
        <br />
        <br />
        {isDelete ? "This action cannot be undone." : "You can restore it later from the trash."}
      </>
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className={isDelete ? "text-destructive" : undefined}>
          <Icon className="h-4 w-4 mr-2" />
          {actionVerb}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {actionVerb} {config.singular}
          </AlertDialogTitle>
          <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAction}
            disabled={isPending}
            className={
              isDelete
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
          >
            {isPending ? `${actionVerb}ing...` : `${actionVerb} ${config.singular}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
