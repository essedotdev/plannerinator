"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatShortDate } from "@/lib/dates";
import { ConfirmDialog } from "@/components/common";
import type { TrashItem } from "@/features/trash/queries";
import { restoreFromTrashTask, hardDeleteTask } from "@/features/tasks/actions";
import { restoreFromTrashEvent, hardDeleteEvent } from "@/features/events/actions";
import { restoreFromTrashNote, hardDeleteNote } from "@/features/notes/actions";
import { restoreFromTrashProject, hardDeleteProject } from "@/features/projects/actions";

interface TrashListProps {
  items: TrashItem[];
}

/**
 * Entity type display configuration
 */
const ENTITY_TYPE_CONFIG = {
  task: {
    label: "Task",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  event: {
    label: "Event",
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  },
  note: {
    label: "Note",
    color: "bg-green-500/10 text-green-700 dark:text-green-300",
  },
  project: {
    label: "Project",
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  },
} as const;

export function TrashList({ items }: TrashListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TrashItem | null>(null);

  const handleRestore = async (item: TrashItem) => {
    startTransition(async () => {
      try {
        switch (item.type) {
          case "task":
            await restoreFromTrashTask(item.id);
            break;
          case "event":
            await restoreFromTrashEvent(item.id);
            break;
          case "note":
            await restoreFromTrashNote(item.id);
            break;
          case "project":
            await restoreFromTrashProject(item.id);
            break;
        }
        toast.success(`${ENTITY_TYPE_CONFIG[item.type].label} restored`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : `Failed to restore ${item.type}`);
      }
    });
  };

  const handleDelete = (item: TrashItem) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    setShowDeleteDialog(false);

    startTransition(async () => {
      try {
        switch (selectedItem.type) {
          case "task":
            await hardDeleteTask(selectedItem.id);
            break;
          case "event":
            await hardDeleteEvent(selectedItem.id);
            break;
          case "note":
            await hardDeleteNote(selectedItem.id);
            break;
          case "project":
            await hardDeleteProject(selectedItem.id);
            break;
        }
        toast.success(`${ENTITY_TYPE_CONFIG[selectedItem.type].label} permanently deleted`);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : `Failed to delete ${selectedItem.type}`
        );
      } finally {
        setSelectedItem(null);
      }
    });
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Trash2 className="h-12 w-12 opacity-20" />
            <p className="text-lg font-medium">Trash is empty</p>
            <p className="text-sm">Deleted items will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={`${item.type}-${item.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Title and Metadata */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {/* Entity Type Badge */}
                    <Badge variant="outline" className={ENTITY_TYPE_CONFIG[item.type].color}>
                      {ENTITY_TYPE_CONFIG[item.type].label}
                    </Badge>

                    {/* Deleted Date */}
                    <span className="text-xs text-muted-foreground">
                      Deleted {formatShortDate(item.deletedAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Restore Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(item)}
                    disabled={isPending}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore
                  </Button>

                  {/* Permanent Delete Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item)}
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Forever
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Permanently Delete?"
        description={
          selectedItem
            ? `Are you sure you want to permanently delete "${selectedItem.title}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete Forever"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
