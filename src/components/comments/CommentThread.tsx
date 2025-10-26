"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { EntityType } from "@/features/comments/schema";
import { MessageSquare } from "lucide-react";
import { useOptimistic, useState } from "react";
import { CommentCard } from "./CommentCard";
import { CommentForm } from "./CommentForm";

/**
 * Comment Thread Component
 *
 * Displays all comments for an entity with:
 * - New comment form at the top
 * - List of comments with replies
 * - Nested reply forms
 */

interface CommentData {
  comment: {
    id: string;
    content: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    userId: string;
    parentCommentId: string | null;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  isPending?: boolean; // Flag for optimistic updates
}

interface CommentThreadProps {
  entityType: EntityType;
  entityId: string;
  currentUserId: string;
  initialComments: CommentData[];
}

export function CommentThread({
  entityType,
  entityId,
  currentUserId,
  initialComments,
}: CommentThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Optimistic updates for immediate UI feedback
  const [optimisticComments, addOptimisticComment] = useOptimistic<CommentData[], CommentData>(
    initialComments,
    (state, newComment) => [newComment, ...state]
  );

  // Organize comments into a tree structure
  const topLevelComments = optimisticComments.filter((c) => !c.comment.parentCommentId);

  const getReplies = (parentId: string) => {
    return optimisticComments.filter((c) => c.comment.parentCommentId === parentId);
  };

  // Function to create an optimistic comment
  const createOptimisticComment = (content: string, parentCommentId?: string) => {
    // Try to get current user info from existing comments
    const currentUserComment = initialComments.find((c) => c.user.id === currentUserId);
    const currentUserInfo = currentUserComment?.user || {
      id: currentUserId,
      name: null,
      email: "",
      image: null,
    };

    const optimisticComment: CommentData = {
      comment: {
        id: `temp-${Date.now()}`, // Temporary ID
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUserId,
        parentCommentId: parentCommentId || null,
      },
      user: currentUserInfo,
      isPending: true, // Mark as pending
    };

    addOptimisticComment(optimisticComment);
  };

  const renderComment = (commentData: CommentData) => {
    const replies = getReplies(commentData.comment.id);
    const isReplyingToThis = replyingTo === commentData.comment.id;

    return (
      <div key={commentData.comment.id}>
        <CommentCard
          comment={commentData.comment}
          user={commentData.user}
          currentUserId={currentUserId}
          entityType={entityType}
          entityId={entityId}
          onReply={setReplyingTo}
          isPending={commentData.isPending}
          replies={
            <>
              {/* Reply Form */}
              {isReplyingToThis && (
                <div className="mb-3">
                  <CommentForm
                    mode="create"
                    entityType={entityType}
                    entityId={entityId}
                    parentCommentId={commentData.comment.id}
                    onSuccess={() => setReplyingTo(null)}
                    onCancel={() => setReplyingTo(null)}
                    onOptimisticAdd={createOptimisticComment}
                  />
                </div>
              )}

              {/* Nested Replies */}
              {replies.map((reply) => (
                <CommentCard
                  key={reply.comment.id}
                  comment={reply.comment}
                  user={reply.user}
                  currentUserId={currentUserId}
                  entityType={entityType}
                  entityId={entityId}
                  isPending={reply.isPending}
                />
              ))}
            </>
          }
        />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments ({optimisticComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        <div>
          <CommentForm
            mode="create"
            entityType={entityType}
            entityId={entityId}
            onOptimisticAdd={createOptimisticComment}
          />
        </div>

        {/* Comments List */}
        {topLevelComments.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              {topLevelComments.map((commentData) => renderComment(commentData))}
            </div>
          </>
        )}

        {/* Empty State */}
        {topLevelComments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
