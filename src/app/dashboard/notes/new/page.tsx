"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common";
import { NoteForm } from "@/components/notes/NoteForm";
import { TagsCard } from "@/components/tags/TagsCard";
import { ParentNoteCard } from "@/components/notes/ParentNoteCard";

/**
 * Create new note page
 */
export default function NewNotePage() {
  const [parentNoteId, setParentNoteId] = useState<string | undefined>();
  const [tags, setTags] = useState<Array<{ id: string; name: string; color: string }>>([]);

  return (
    <div className="space-y-6">
      <PageHeader title="New Note" description="Create a new note or document" />
      <NoteForm mode="create" parentNoteId={parentNoteId} selectedTags={tags} />

      {/* Tags and Parent Note - Side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TagsCard mode="create" entityType="note" initialTags={tags} onTagsChange={setTags} />
        <ParentNoteCard mode="create" onParentChange={setParentNoteId} />
      </div>
    </div>
  );
}
