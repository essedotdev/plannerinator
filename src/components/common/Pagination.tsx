"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
}

/**
 * Pagination Component
 *
 * Displays pagination info and controls based on Opzione 1 (Minimalista):
 * - Display count: only if total > limit (pagination is needed)
 * - Controls: only if hasMore || offset > 0 (there's something to navigate)
 *
 * @param total - Total number of items
 * @param limit - Items per page
 * @param offset - Current offset
 */
export function Pagination({ total, limit, offset }: PaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Calculate pagination state
  const hasMore = offset + limit < total;
  const hasPrevious = offset > 0;
  const showControls = hasMore || hasPrevious;
  const showCount = total > limit;

  // Don't render anything if no pagination is needed
  if (!showCount && !showControls) {
    return null;
  }

  // Calculate current range
  const start = offset + 1;
  const end = Math.min(offset + limit, total);

  // Build URL with updated offset
  const buildUrl = (newOffset: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newOffset > 0) {
      params.set("offset", newOffset.toString());
    } else {
      params.delete("offset");
    }
    return `${pathname}?${params.toString()}`;
  };

  const handlePrevious = () => {
    const newOffset = Math.max(0, offset - limit);
    router.push(buildUrl(newOffset));
  };

  const handleNext = () => {
    const newOffset = offset + limit;
    router.push(buildUrl(newOffset));
  };

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      {/* Count display */}
      {showCount && (
        <div className="text-sm text-muted-foreground">
          Showing {start}-{end} of {total}
        </div>
      )}

      {/* Navigation controls */}
      {showControls && (
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={handlePrevious} disabled={!hasPrevious}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext} disabled={!hasMore}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
