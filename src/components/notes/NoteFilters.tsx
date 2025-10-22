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
import { X } from "lucide-react";
import { useCallback } from "react";

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
    searchParams.has("type") || searchParams.has("isFavorite") || searchParams.has("search");

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="flex-1">
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
          <SelectValue placeholder="All types" />
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
          <SelectValue placeholder="All notes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All notes</SelectItem>
          <SelectItem value="true">Favorites only</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="outline" size="icon" onClick={clearFilters}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
