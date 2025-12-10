/**
 * Conversation List Component
 *
 * Displays a list of recent AI conversations in the sidebar.
 */

"use client";

import { useAiDrawer } from "@/hooks/use-ai-drawer";
import type { AiConversation } from "@/db/schema";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
}

export function ConversationList({ onSelectConversation }: ConversationListProps) {
  const { conversations, conversationId, isLoadingConversations } = useAiDrawer();

  if (isLoadingConversations) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center px-4">
        <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Nessuna conversazione</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === conversationId}
            onClick={() => onSelectConversation(conversation.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface ConversationItemProps {
  conversation: AiConversation;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  // Get first user message or fallback to title
  const displayTitle =
    conversation.title || conversation.messages[0]?.content.substring(0, 50) || "Nuova chat";

  // Format time ago
  const timeAgo = formatDistanceToNow(new Date(conversation.updatedAt), {
    addSuffix: true,
    locale: it,
  });

  // Count messages
  const messageCount = conversation.messages.length;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg px-3 py-2.5 transition-colors",
        "hover:bg-accent/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "bg-accent"
      )}
    >
      <div className="flex items-start gap-2">
        <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "text-sm font-medium truncate",
              isActive ? "text-foreground" : "text-foreground/80"
            )}
          >
            {displayTitle}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {messageCount} {messageCount === 1 ? "messaggio" : "messaggi"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
