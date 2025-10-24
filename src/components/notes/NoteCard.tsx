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
import { FileText, Star, MoreVertical, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteNote, toggleNoteFavorite } from "@/features/notes/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NOTE_TYPE_LABELS } from "@/lib/labels";
import { formatShortDate } from "@/lib/dates";
import { ConfirmDialog } from "@/components/common";

/**
 * Note type colors
 */
const NOTE_TYPE_COLORS = {
  note: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
  document: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  research: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  idea: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  snippet: "bg-green-500/10 text-green-700 dark:text-green-300",
} as const;

interface NoteCardProps {
  note: {
    id: string;
    title: string | null;
    content: string | null;
    type: "note" | "document" | "research" | "idea" | "snippet";
    isFavorite: boolean;
    createdAt: Date;
    updatedAt: Date;
    project?: {
      id: string;
      name: string;
      color: string | null;
    } | null;
  };
}

export function NoteCard({ note }: NoteCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);

    startTransition(async () => {
      try {
        await deleteNote(note.id);
        toast.success("Note deleted");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete note");
      }
    });
  };

  const handleToggleFavorite = async () => {
    startTransition(async () => {
      try {
        await toggleNoteFavorite(note.id, !note.isFavorite);
        toast.success(note.isFavorite ? "Removed from favorites" : "Added to favorites");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update favorite");
      }
    });
  };

  // Get preview text (first 200 chars of content)
  const preview = note.content ? note.content.slice(0, 200) : null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Note Icon */}
          <FileText className="h-5 w-5 text-muted-foreground mt-1" />

          {/* Note Content */}
          <div className="flex-1 min-w-0">
            <Link href={`/dashboard/notes/${note.id}`} className="group">
              <h3 className="font-medium hover:text-primary transition-colors">
                {note.title || "Untitled Note"}
              </h3>
            </Link>

            {preview && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{preview}</p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {/* Type */}
              <Badge variant="outline" className={NOTE_TYPE_COLORS[note.type]}>
                {NOTE_TYPE_LABELS[note.type]}
              </Badge>

              {/* Favorite */}
              {note.isFavorite && (
                <Badge
                  variant="outline"
                  className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
                >
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Favorite
                </Badge>
              )}

              {/* Project */}
              {note.project && (
                <Badge variant="outline" style={{ borderColor: note.project.color || undefined }}>
                  {note.project.name}
                </Badge>
              )}

              {/* Updated time */}
              <span className="text-xs text-muted-foreground">
                Updated {formatShortDate(note.updatedAt)}
              </span>
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
                <Link href={`/dashboard/notes/${note.id}`} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleToggleFavorite}
                disabled={isPending}
                className="cursor-pointer"
              >
                <Star className="h-4 w-4 mr-2" />
                {note.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </DropdownMenuItem>
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
        title="Delete Note"
        description={`Are you sure you want to delete "${note.title || "this note"}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </Card>
  );
}
