import { PageHeader } from "@/components/common";
import { NoteForm } from "@/components/notes/NoteForm";

/**
 * Create new note page
 */
export default function NewNotePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Note" description="Create a new note or document" />
      <NoteForm mode="create" />
    </div>
  );
}
