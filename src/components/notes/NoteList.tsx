import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common";
import { NoteCard } from "./NoteCard";

interface NoteListProps {
  notes: Array<{
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
  }>;
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No notes found"
        description="Create your first note to capture your thoughts and ideas"
        action={
          <Button asChild>
            <Link href="/dashboard/notes/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
