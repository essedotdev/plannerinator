"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment, updateComment } from "@/features/comments/actions";
import type { EntityType } from "@/features/comments/schema";
import { useRouter } from "next/navigation";

/**
 * Comment Form Component
 *
 * Used for creating new comments or editing existing ones
 * Can be used for both top-level comments and replies
 */

interface CommentFormProps {
  mode: "create" | "edit";
  entityType: EntityType;
  entityId: string;
  parentCommentId?: string;
  initialContent?: string;
  commentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CommentForm({
  mode,
  entityType,
  entityId,
  parentCommentId,
  initialContent = "",
  commentId,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState(initialContent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createComment({
            content: content.trim(),
            entityType,
            entityId,
            parentCommentId,
          });
          toast.success(parentCommentId ? "Reply added" : "Comment added");
          setContent("");
        } else {
          if (!commentId) {
            throw new Error("Comment ID is required for edit mode");
          }
          await updateComment(commentId, {
            content: content.trim(),
          });
          toast.success("Comment updated");
        }

        router.refresh();
        onSuccess?.();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save comment");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentCommentId ? "Write a reply..." : "Add a comment..."}
        disabled={isPending}
        rows={3}
        maxLength={5000}
        className="resize-none"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{content.length}/5000</span>
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
            {isPending
              ? "Saving..."
              : mode === "create"
                ? parentCommentId
                  ? "Reply"
                  : "Comment"
                : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
