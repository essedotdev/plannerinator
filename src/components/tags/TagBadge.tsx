"use client";

import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Tag Badge Component
 *
 * Displays a tag with its color
 * Optionally shows a remove button
 */

interface TagBadgeProps {
  tag: {
    id: string;
    name: string;
    color: string;
  };
  onRemove?: () => void;
  className?: string;
}

export function TagBadge({ tag, onRemove, className }: TagBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 pr-1", className)}
      style={{
        borderColor: tag.color,
        color: tag.color,
      }}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-sm hover:bg-accent hover:text-accent-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}
