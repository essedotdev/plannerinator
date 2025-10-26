"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { formatRelative, areDatesEqual } from "@/lib/dates";
import Image from "next/image";
import { MoreVertical, Edit, Trash2, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommentForm } from "./CommentForm";
import { deleteComment } from "@/features/comments/actions";
import type { EntityType } from "@/features/comments/schema";
import { useRouter } from "next/navigation";

/**
 * Comment Card Component
 *
 * Displays a single comment with:
 * - User info and timestamp
 * - Comment content
 * - Actions: Edit, Delete, Reply
 */

interface CommentCardProps {
  comment: {
    id: string;
    content: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    userId: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  currentUserId: string;
  entityType: EntityType;
  entityId: string;
  onReply?: (commentId: string) => void;
  replies?: React.ReactNode;
  isPending?: boolean;
}

export function CommentCard({
  comment,
  user,
  currentUserId,
  entityType,
  entityId,
  onReply,
  replies,
  isPending = false,
}: CommentCardProps) {
  const router = useRouter();
  const [isDeleting, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwner = comment.userId === currentUserId;
  const isEdited = !areDatesEqual(comment.createdAt, comment.updatedAt);

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteComment(comment.id);
        toast.success("Comment deleted");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete comment");
      }
    });
  };

  if (isEditing) {
    return (
      <div className="bg-muted/50 p-4 rounded-lg">
        <CommentForm
          mode="edit"
          entityType={entityType}
          entityId={entityId}
          initialContent={comment.content}
          commentId={comment.id}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`bg-muted/50 p-4 rounded-lg ${isPending ? "opacity-60" : ""}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* User Avatar */}
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
            )}

            {/* User Name and Timestamp */}
            <div>
              <p className="text-sm font-medium">{user.name || user.email || "User"}</p>
              <p className="text-xs text-muted-foreground">
                {isPending ? "Posting..." : formatRelative(comment.createdAt)}
                {!isPending && isEdited && " (edited)"}
              </p>
            </div>
          </div>

          {/* Actions Menu (only for owner and not pending) */}
          {isOwner && !isPending && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>

        {/* Reply Button (not shown for pending comments) */}
        {onReply && !isPending && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 text-xs"
            onClick={() => onReply(comment.id)}
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
        )}
      </div>

      {/* Replies */}
      {replies && <div className="ml-8 space-y-3">{replies}</div>}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone and will
              also delete all replies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
