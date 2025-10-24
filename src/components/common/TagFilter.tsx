"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tag, X, ChevronDown } from "lucide-react";
import { getTags } from "@/features/tags/queries";
import { Separator } from "@/components/ui/separator";

interface TagOption {
  id: string;
  name: string;
  color: string;
}

interface TagFilterProps {
  /**
   * Base path for navigation (e.g., "/dashboard/tasks")
   */
  basePath: string;
}

/**
 * TagFilter Component
 *
 * Reusable multi-select tag filter with AND/OR logic toggle.
 *
 * Features:
 * - Multi-select tag filter with checkboxes
 * - AND/OR logic toggle (OR = has any tag, AND = has all tags)
 * - URL sync (tags + tagLogic params)
 * - Badge display of active tags
 * - Clear filters button
 *
 * URL Params:
 * - tags: Comma-separated list of tag IDs
 * - tagLogic: "AND" or "OR" (default: "OR")
 *
 * Example URL: /dashboard/tasks?tags=uuid1,uuid2&tagLogic=AND
 */
export function TagFilter({ basePath }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tags, setTags] = useState<TagOption[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [open, setOpen] = useState(false);

  // Parse selected tags from URL
  const selectedTagIds = useMemo(
    () => searchParams.get("tags")?.split(",").filter(Boolean) || [],
    [searchParams]
  );
  const tagLogic = (searchParams.get("tagLogic") || "OR") as "AND" | "OR";

  // Load available tags
  useEffect(() => {
    async function loadTags() {
      try {
        const result = await getTags({ sortBy: "name", sortOrder: "asc" });
        setTags(result.tags);
      } catch (error) {
        console.error("Failed to load tags:", error);
      } finally {
        setLoadingTags(false);
      }
    }
    loadTags();
  }, []);

  // Get selected tag objects
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));

  // Update URL with tag filter
  const updateTagFilter = useCallback(
    (tagIds: string[], logic: "AND" | "OR") => {
      const params = new URLSearchParams(searchParams.toString());

      if (tagIds.length > 0) {
        params.set("tags", tagIds.join(","));
        params.set("tagLogic", logic);
      } else {
        params.delete("tags");
        params.delete("tagLogic");
      }

      router.push(`${basePath}?${params.toString()}`);
    },
    [router, searchParams, basePath]
  );

  // Toggle tag selection
  const toggleTag = useCallback(
    (tagId: string) => {
      const newSelection = selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId];

      updateTagFilter(newSelection, tagLogic);
    },
    [selectedTagIds, tagLogic, updateTagFilter]
  );

  // Toggle AND/OR logic
  const toggleLogic = useCallback(() => {
    const newLogic = tagLogic === "AND" ? "OR" : "AND";
    updateTagFilter(selectedTagIds, newLogic);
  }, [tagLogic, selectedTagIds, updateTagFilter]);

  // Clear all tag filters
  const clearTags = useCallback(() => {
    updateTagFilter([], "OR");
  }, [updateTagFilter]);

  // Remove single tag
  const removeTag = useCallback(
    (tagId: string) => {
      const newSelection = selectedTagIds.filter((id) => id !== tagId);
      updateTagFilter(newSelection, tagLogic);
    },
    [selectedTagIds, tagLogic, updateTagFilter]
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Popover Trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full sm:w-[180px] justify-between">
            <span className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
              {selectedTagIds.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {selectedTagIds.length}
                </Badge>
              )}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)]" align="start">
          <div className="space-y-4">
            {/* AND/OR Toggle */}
            {selectedTagIds.length > 1 && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Match logic:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleLogic}
                    className="h-7 px-2 font-mono"
                  >
                    {tagLogic}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {tagLogic === "OR"
                    ? "Show items with any selected tag"
                    : "Show items with all selected tags"}
                </div>
                <Separator />
              </>
            )}

            {/* Tag List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {loadingTags ? (
                <div className="text-sm text-muted-foreground">Loading tags...</div>
              ) : tags.length === 0 ? (
                <div className="text-sm text-muted-foreground">No tags available</div>
              ) : (
                tags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={selectedTagIds.includes(tag.id)}
                      onCheckedChange={() => toggleTag(tag.id)}
                    />
                    <Label
                      htmlFor={`tag-${tag.id}`}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm">{tag.name}</span>
                    </Label>
                  </div>
                ))
              )}
            </div>

            {/* Clear Button */}
            {selectedTagIds.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearTags} className="h-7 text-xs w-full">
                Clear
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
