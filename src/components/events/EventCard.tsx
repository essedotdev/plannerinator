"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  MapPin,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  Archive,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteEvent, duplicateEvent, archiveEvent, restoreEvent } from "@/features/events/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EVENT_CALENDAR_TYPE_LABELS } from "@/lib/labels";
import { formatShortDate, formatTime, isPast } from "@/lib/dates";
import { ConfirmDialog } from "@/components/common";

/**
 * Calendar type colors
 */
const CALENDAR_TYPE_COLORS = {
  personal: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  work: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  family: "bg-green-500/10 text-green-700 dark:text-green-300",
  other: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
} as const;

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date | null;
    allDay: boolean;
    location: string | null;
    calendarType: "personal" | "work" | "family" | "other";
    archivedAt?: Date | null;
    project?: {
      id: string;
      name: string;
      color: string | null;
    } | null;
  };
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);

    startTransition(async () => {
      try {
        await deleteEvent(event.id);
        toast.success("Event deleted");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete event");
      }
    });
  };

  const handleDuplicate = async () => {
    startTransition(async () => {
      try {
        const result = await duplicateEvent(event.id);
        toast.success("Event duplicated");
        if (result.event) {
          router.push(`/dashboard/events/${result.event.id}`);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to duplicate event");
      }
    });
  };

  const handleArchive = async () => {
    startTransition(async () => {
      try {
        await archiveEvent(event.id);
        toast.success("Event archived");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to archive event");
      }
    });
  };

  const handleRestore = async () => {
    startTransition(async () => {
      try {
        await restoreEvent(event.id);
        toast.success("Event restored");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to restore event");
      }
    });
  };

  // Check if event is in the past
  const isEventPast = isPast(event.startTime);

  return (
    <Card className={isEventPast ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Event Content */}
          <div className="flex-1 min-w-0">
            <Link href={`/dashboard/events/${event.id}`} className="group">
              <h3 className="font-medium hover:text-primary transition-colors">{event.title}</h3>
            </Link>

            {event.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {/* Calendar Type */}
              <Badge variant="outline" className={CALENDAR_TYPE_COLORS[event.calendarType]}>
                {EVENT_CALENDAR_TYPE_LABELS[event.calendarType]}
              </Badge>

              {/* All Day Badge */}
              {event.allDay && (
                <Badge
                  variant="outline"
                  className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                >
                  All Day
                </Badge>
              )}

              {/* Archived Badge */}
              {event.archivedAt && (
                <Badge
                  variant="outline"
                  className="bg-gray-500/10 text-gray-700 dark:text-gray-300"
                >
                  Archived
                </Badge>
              )}

              {/* Project */}
              {event.project && (
                <Badge variant="outline" style={{ borderColor: event.project.color || undefined }}>
                  {event.project.name}
                </Badge>
              )}

              {/* Start Time */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {event.allDay
                    ? formatShortDate(event.startTime)
                    : `${formatShortDate(event.startTime)}, ${formatTime(event.startTime)}`}
                </span>
              </div>

              {/* End Time */}
              {event.endTime && !event.allDay && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(event.endTime)}</span>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[200px]">{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/events/${event.id}`} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate} disabled={isPending}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {event.archivedAt ? (
                <DropdownMenuItem onClick={handleRestore} disabled={isPending}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleArchive} disabled={isPending}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                disabled={isPending}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        description={`Are you sure you want to delete "${event.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </Card>
  );
}
