"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag as TagIcon } from "lucide-react";
import { TagInput } from "./TagInput";
import { TagSelector } from "./TagSelector";
import { TagBadge } from "./TagBadge";
import type { EntityType } from "@/features/tags/schema";

interface TagsCardProps {
  mode: "create" | "edit" | "view";
  entityType: EntityType;
  entityId?: string;
  initialTags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  onTagsChange?: (tags: Array<{ id: string; name: string; color: string }>) => void;
}

/**
 * TagsCard Component
 *
 * Displays and manages tags for an entity across different modes:
 * - view: Read-only display of tags
 * - edit: Full tag management with TagInput (requires entityId)
 * - create: Local tag selection without persisting (no entityId required yet)
 */
export function TagsCard({ mode, entityType, entityId, initialTags, onTagsChange }: TagsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TagIcon className="h-4 w-4" />
          Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mode === "view" ? (
          // View mode: Read-only tag display (no onRemove = read-only)
          <div className="flex flex-wrap gap-2">
            {initialTags.length > 0 ? (
              initialTags.map((tag) => <TagBadge key={tag.id} tag={tag} />)
            ) : (
              <p className="text-sm text-muted-foreground">No tags</p>
            )}
          </div>
        ) : mode === "edit" && entityId ? (
          // Edit mode: Full tag management (requires entityId)
          <TagInput entityType={entityType} entityId={entityId} initialTags={initialTags} />
        ) : mode === "create" && onTagsChange ? (
          // Create mode: Local tag selection (no entityId required)
          <TagSelector selectedTags={initialTags} onTagsChange={onTagsChange} />
        ) : null}
      </CardContent>
    </Card>
  );
}
