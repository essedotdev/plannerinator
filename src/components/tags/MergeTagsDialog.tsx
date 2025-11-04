"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { mergeTags } from "@/features/tags/actions";
import type { Tag } from "@/db/schema";

/**
 * Merge Tags Dialog Component
 *
 * Modal dialog for merging multiple tags into one
 */

interface MergeTagsDialogProps {
  tags: Tag[];
  isOpen: boolean;
  onClose: () => void;
}

export function MergeTagsDialog({ tags, isOpen, onClose }: MergeTagsDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [targetTagId, setTargetTagId] = useState(tags[0]?.id || "");

  const handleMerge = () => {
    if (!targetTagId) {
      toast.error("Please select a target tag");
      return;
    }

    const sourceTagIds = tags.filter((tag) => tag.id !== targetTagId).map((tag) => tag.id);

    if (sourceTagIds.length === 0) {
      toast.error("No tags to merge");
      return;
    }

    startTransition(async () => {
      try {
        const result = await mergeTags({
          sourceTagIds,
          targetTagId,
        });

        const targetTag = tags.find((t) => t.id === targetTagId);
        toast.success(
          `Merged ${result.mergedCount} tag(s) into "${targetTag?.name}". Reassigned ${result.reassignedCount} entities.`
        );
        onClose();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to merge tags");
      }
    });
  };

  if (tags.length < 2) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Merge Tags</DialogTitle>
          <DialogDescription>
            Select which tag to keep. All other tags will be merged into it and deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select target tag (to keep):</Label>
            <RadioGroup value={targetTagId} onValueChange={setTargetTagId}>
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={tag.id} id={tag.id} />
                  <Label htmlFor={tag.id} className="flex items-center gap-2 cursor-pointer">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                    <span className="font-medium">{tag.name}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">What will happen:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>All entities tagged with the other tags will be re-tagged with the target tag</li>
              <li>
                {tags.filter((t) => t.id !== targetTagId).length} tag(s) will be deleted:{" "}
                {tags
                  .filter((t) => t.id !== targetTagId)
                  .map((t) => t.name)
                  .join(", ")}
              </li>
              <li>This action cannot be undone</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleMerge} disabled={isPending}>
              {isPending ? "Merging..." : "Merge Tags"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
