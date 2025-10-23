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
import { PROJECT_STATUS_LABELS } from "@/lib/labels";
import { TagFilter } from "@/components/common/TagFilter";

/**
 * Project filters component
 *
 * Allows filtering projects by:
 * - Status (active, on_hold, completed, archived, cancelled)
 * - Search query (name + description)
 *
 * Filters are synced with URL search params
 */
export function ProjectFilters() {
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

      router.push(`/dashboard/projects?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/dashboard/projects");
  }, [router]);

  const hasFilters =
    searchParams.has("status") || searchParams.has("search") || searchParams.has("tags");

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <Input
          type="search"
          placeholder="Search projects..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => {
            const value = e.target.value;
            // Debounce search
            setTimeout(() => updateFilter("search", value || null), 300);
          }}
          className="w-full"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={searchParams.get("status") || "all"}
        onValueChange={(value) => updateFilter("status", value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">{PROJECT_STATUS_LABELS.active}</SelectItem>
          <SelectItem value="on_hold">{PROJECT_STATUS_LABELS.on_hold}</SelectItem>
          <SelectItem value="completed">{PROJECT_STATUS_LABELS.completed}</SelectItem>
          <SelectItem value="archived">{PROJECT_STATUS_LABELS.archived}</SelectItem>
          <SelectItem value="cancelled">{PROJECT_STATUS_LABELS.cancelled}</SelectItem>
        </SelectContent>
      </Select>

      {/* Tag Filter */}
      <TagFilter basePath="/dashboard/projects" />

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="outline" size="icon" onClick={clearFilters}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
