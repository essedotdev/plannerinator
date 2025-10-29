"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tag as TagIcon, MoreVertical, Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EditTagDialog } from "./EditTagDialog";
import { MergeTagsDialog } from "./MergeTagsDialog";
import { deleteTag, bulkDeleteTags } from "@/features/tags/actions";
import type { Tag } from "@/db/schema";

/**
 * Tag Manager List Component
 *
 * Displays all tags with usage statistics and management actions
 */

interface TagManagerListProps {
  tags: Tag[];
  statsMap: Map<
    string,
    {
      usageByType: Record<string, number>;
      totalUsage: number;
    }
  >;
}

export function TagManagerList({ tags, statsMap }: TagManagerListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [mergingTags, setMergingTags] = useState<Tag[] | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const handleDelete = async (tagId: string, tagName: string) => {
    startTransition(async () => {
      try {
        await deleteTag(tagId);
        toast.success(`Tag "${tagName}" deleted`);
        setDeletingTagId(null);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete tag");
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedTags.size === 0) return;

    startTransition(async () => {
      try {
        await bulkDeleteTags({
          tagIds: Array.from(selectedTags),
        });
        toast.success(`${selectedTags.size} tag(s) deleted`);
        setSelectedTags(new Set());
        setShowBulkDeleteDialog(false);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete tags");
      }
    });
  };

  const toggleTagSelection = (tagId: string) => {
    const newSelection = new Set(selectedTags);
    if (newSelection.has(tagId)) {
      newSelection.delete(tagId);
    } else {
      newSelection.add(tagId);
    }
    setSelectedTags(newSelection);
  };

  const handleMergeTags = () => {
    const tagsToMerge = tags.filter((tag) => selectedTags.has(tag.id));
    if (tagsToMerge.length < 2) {
      toast.error("Select at least 2 tags to merge");
      return;
    }
    setMergingTags(tagsToMerge);
  };

  if (tags.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <TagIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No tags yet</h3>
        <p className="text-sm text-muted-foreground">
          Create your first tag to organize your content
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedTags.size > 0 && (
        <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
          <div className="text-sm">
            {selectedTags.size} tag(s) selected
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => setSelectedTags(new Set())}
            >
              Clear
            </Button>
          </div>
          <div className="flex gap-2">
            {selectedTags.size >= 2 && (
              <Button variant="outline" size="sm" onClick={handleMergeTags} disabled={isPending}>
                <Users className="h-4 w-4 mr-2" />
                Merge Tags
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() => setShowBulkDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Tags Table */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={selectedTags.size === tags.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTags(new Set(tags.map((t) => t.id)));
                    } else {
                      setSelectedTags(new Set());
                    }
                  }}
                  className="rounded"
                />
              </th>
              <th className="text-left p-4 font-medium">Tag</th>
              <th className="text-left p-4 font-medium">Usage</th>
              <th className="text-left p-4 font-medium">Tasks</th>
              <th className="text-left p-4 font-medium">Events</th>
              <th className="text-left p-4 font-medium">Notes</th>
              <th className="text-left p-4 font-medium">Projects</th>
              <th className="w-12 p-4"></th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => {
              const stats = statsMap.get(tag.id) || { usageByType: {}, totalUsage: 0 };
              return (
                <tr key={tag.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedTags.has(tag.id)}
                      onChange={() => toggleTagSelection(tag.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="font-medium">{tag.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{stats.totalUsage} total</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{stats.usageByType.task || 0}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{stats.usageByType.event || 0}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{stats.usageByType.note || 0}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{stats.usageByType.project || 0}</span>
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={isPending}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingTag(tag)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingTagId(tag.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      {editingTag && (
        <EditTagDialog tag={editingTag} isOpen={!!editingTag} onClose={() => setEditingTag(null)} />
      )}

      {/* Merge Dialog */}
      {mergingTags && (
        <MergeTagsDialog
          tags={mergingTags}
          isOpen={!!mergingTags}
          onClose={() => {
            setMergingTags(null);
            setSelectedTags(new Set());
          }}
        />
      )}

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        onConfirm={handleBulkDelete}
        title="Delete Selected Tags"
        description={`Are you sure you want to delete ${selectedTags.size} tag(s)? This will remove all associations with entities.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingTagId}
        onOpenChange={(open) => !open && setDeletingTagId(null)}
        onConfirm={() => {
          const tag = tags.find((t) => t.id === deletingTagId);
          if (tag) handleDelete(tag.id, tag.name);
        }}
        title="Delete Tag"
        description="Are you sure you want to delete this tag? This will remove all associations with entities."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
