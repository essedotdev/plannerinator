"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { archiveNote } from "@/features/notes/actions";
import { toast } from "sonner";

interface ArchiveNoteButtonProps {
  noteId: string;
  noteTitle: string;
}

export function ArchiveNoteButton({ noteId, noteTitle }: ArchiveNoteButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    startTransition(async () => {
      try {
        await archiveNote(noteId);
        toast.success("Note archived successfully");
        router.push("/dashboard/notes");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to archive note");
        setIsOpen(false);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Archive className="h-4 w-4 mr-2" />
          Archive
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Note</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to archive <strong>"{noteTitle}"</strong>?
            <br />
            <br />
            You can restore it later from the trash.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive} disabled={isPending}>
            {isPending ? "Archiving..." : "Archive Note"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
