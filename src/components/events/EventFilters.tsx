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
import { X, Calendar, Clock } from "lucide-react";
import { useCallback } from "react";
import { TagFilter } from "@/components/common/TagFilter";

/**
 * Event filters component
 *
 * Allows filtering events by:
 * - Calendar Type (personal, work, family, other)
 * - All Day (true/false)
 * - Search query (title + description + location)
 *
 * Filters are synced with URL search params
 */
export function EventFilters() {
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

      router.push(`/dashboard/events?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/dashboard/events");
  }, [router]);

  const hasFilters =
    searchParams.has("calendarType") ||
    searchParams.has("allDay") ||
    searchParams.has("search") ||
    searchParams.has("tags");

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <Input
          type="search"
          placeholder="Search events..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => {
            const value = e.target.value;
            // Debounce search
            setTimeout(() => updateFilter("search", value || null), 300);
          }}
          className="w-full"
        />
      </div>

      {/* Calendar Type Filter */}
      <Select
        value={searchParams.get("calendarType") || "all"}
        onValueChange={(value) => updateFilter("calendarType", value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <SelectValue placeholder="All calendars" />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All calendars</SelectItem>
          <SelectItem value="personal">Personal</SelectItem>
          <SelectItem value="work">Work</SelectItem>
          <SelectItem value="family">Family</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      {/* All Day Filter */}
      <Select
        value={searchParams.get("allDay") || "all"}
        onValueChange={(value) => updateFilter("allDay", value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <SelectValue placeholder="All events" />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All events</SelectItem>
          <SelectItem value="true">All-day only</SelectItem>
          <SelectItem value="false">Timed only</SelectItem>
        </SelectContent>
      </Select>

      {/* Tag Filter */}
      <TagFilter basePath="/dashboard/events" />

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="outline" size="icon" onClick={clearFilters}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
