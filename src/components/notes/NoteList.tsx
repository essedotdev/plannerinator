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
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No notes found</p>
        <p className="text-sm text-muted-foreground mt-2">Create your first note to get started</p>
      </div>
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
