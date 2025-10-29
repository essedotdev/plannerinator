"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getNotesForParentSelection } from "@/features/notes/parent-actions";
import { updateNote } from "@/features/notes/actions";
import type { Note } from "@/db/schema";

type NoteOption = Pick<Note, "id" | "title">;

interface ParentNoteCardProps {
  mode: "create" | "edit" | "view";
  noteId?: string; // Required for edit mode
  parentNote?: {
    id: string;
    title: string | null;
  } | null;
  onParentChange?: (parentId: string | undefined) => void; // For create mode
}

/**
 * ParentNoteCard Component
 *
 * Displays and manages parent note relationship across different modes:
 * - view: Read-only display of parent note as link
 * - edit: Allows changing parent note with immediate save
 * - create: Allows selecting parent note (value managed by parent component)
 */
export function ParentNoteCard({ mode, noteId, parentNote, onParentChange }: ParentNoteCardProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteOption[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(mode !== "view");
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(
    parentNote?.id || undefined
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Load available notes for parent selection (edit and create modes)
  useEffect(() => {
    if (mode === "view") return;

    async function loadNotes() {
      try {
        const result = await getNotesForParentSelection(mode === "edit" ? noteId : undefined);
        if (result.success) {
          setNotes(result.notes);
        } else {
          toast.error("Failed to load notes");
        }
      } catch (error) {
        console.error("Failed to load notes:", error);
        toast.error("Failed to load notes");
      } finally {
        setLoadingNotes(false);
      }
    }
    loadNotes();
  }, [mode, noteId]);

  // Handle parent change in edit mode (immediate save)
  const handleParentChangeEdit = async (newParentId: string | undefined) => {
    if (mode !== "edit" || !noteId) return;

    setIsUpdating(true);
    try {
      const result = await updateNote(noteId, { parentNoteId: newParentId || null });
      if (!result.success) {
        throw new Error("Failed to update parent note");
      }
      setSelectedParentId(newParentId);
      toast.success("Parent note updated");
      router.refresh();
    } catch {
      toast.error("Failed to update parent note");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle parent change in create mode (notify parent component)
  const handleParentChangeCreate = (newParentId: string | undefined) => {
    if (mode !== "create") return;
    setSelectedParentId(newParentId);
    onParentChange?.(newParentId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Parent Note</CardTitle>
      </CardHeader>
      <CardContent>
        {mode === "view" ? (
          // View mode: Read-only display
          parentNote ? (
            <Link
              href={`/dashboard/notes/${parentNote.id}`}
              className="block hover:text-primary transition-colors"
            >
              <p className="font-medium">{parentNote.title || "Untitled Note"}</p>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">No parent note</p>
          )
        ) : (
          // Edit/Create mode: Parent note selector
          <div className="space-y-2">
            <Select
              value={selectedParentId || "none"}
              onValueChange={(value) => {
                const newValue = value === "none" ? undefined : value;
                if (mode === "edit") {
                  handleParentChangeEdit(newValue);
                } else {
                  handleParentChangeCreate(newValue);
                }
              }}
              disabled={loadingNotes || isUpdating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingNotes ? "Loading..." : "No parent note"} />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)]">
                <SelectItem value="none">No parent note</SelectItem>
                {notes.map((note) => (
                  <SelectItem key={note.id} value={note.id}>
                    <span className="flex-1 truncate">{note.title || "Untitled Note"}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
