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
import { ListChecks, Flag, Eye } from "lucide-react";
import { useCallback } from "react";
import { TagFilter } from "@/components/common/TagFilter";

/**
 * Task filters component
 *
 * Allows filtering tasks by:
 * - Status (todo, in_progress, done, cancelled)
 * - Priority (low, medium, high, urgent)
 * - Search query (title + description)
 *
 * Filters are synced with URL search params
 */
export function TaskFilters() {
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

      router.push(`/dashboard/tasks?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <Input
          type="search"
          placeholder="Search tasks..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => {
            const value = e.target.value;
            // Debounce search
            setTimeout(() => updateFilter("search", value || null), 300);
          }}
          className="w-full"
        />
      </div>

      {/* View Filter */}
      <Select
        value={searchParams.get("view") || "active"}
        onValueChange={(value) => updateFilter("view", value === "active" ? null : value)}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <SelectValue placeholder="Active" />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
          <SelectItem value="all">All Items</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={searchParams.get("status") || "all"}
        onValueChange={(value) => updateFilter("status", value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <span className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <SelectValue placeholder="All statuses" />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select
        value={searchParams.get("priority") || "all"}
        onValueChange={(value) => updateFilter("priority", value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <span className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            <SelectValue placeholder="All priorities" />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>

      {/* Tag Filter */}
      <TagFilter basePath="/dashboard/tasks" />
    </div>
  );
}
