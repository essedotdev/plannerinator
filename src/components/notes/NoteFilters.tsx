"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, FileText, Star } from "lucide-react";
import { useCallback } from "react";
import { TagFilter } from "@/components/common/TagFilter";

/**
 * Note filters component
 *
 * Allows filtering notes by:
 * - Type (note, document, research, idea, snippet)
 * - Favorites (show only favorites)
 * - Search query (title + content)
 *
 * Filters are synced with URL search params
 */
export function NoteFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      router.push(`/dashboard/notes?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/dashboard/notes");
  }, [router]);

  const hasFilters =
    searchParams.has("type") ||
    searchParams.has("isFavorite") ||
    searchParams.has("search") ||
    searchParams.has("tags");

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <Input
          type="search"
          placeholder="Search notes..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => {
            const value = e.target.value;
            // Debounce search
            setTimeout(() => updateFilter("search", value || null), 300);
          }}
          className="w-full"
        />
      </div>

      {/* Type Filter */}
      <Select
        value={searchParams.get("type") || "all"}
        onValueChange={(value) => updateFilter("type", value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <SelectValue placeholder="All types" />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="note">Note</SelectItem>
          <SelectItem value="document">Document</SelectItem>
          <SelectItem value="research">Research</SelectItem>
          <SelectItem value="idea">Idea</SelectItem>
          <SelectItem value="snippet">Snippet</SelectItem>
        </SelectContent>
      </Select>

      {/* Favorites Filter */}
      <Select
        value={searchParams.get("isFavorite") || "all"}
        onValueChange={(value) => updateFilter("isFavorite", value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <span className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <SelectValue placeholder="All notes" />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All notes</SelectItem>
          <SelectItem value="true">Favorites only</SelectItem>
        </SelectContent>
      </Select>

      {/* Tag Filter */}
      <TagFilter basePath="/dashboard/notes" />

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="outline" size="icon" onClick={clearFilters}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
