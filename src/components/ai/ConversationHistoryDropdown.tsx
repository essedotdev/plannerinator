/**
 * Conversation History Dropdown Component
 *
 * Dropdown menu showing recent AI conversations.
 * Opens below the header with a compact list view.
 */

"use client";

import { useAiDrawer } from "@/hooks/use-ai-drawer";
import type { AiConversation } from "@/db/schema";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { MessageSquare, Loader2, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConversationHistoryDropdownProps {
  onSelectConversation: (id: string) => void;
}

export function ConversationHistoryDropdown({
  onSelectConversation,
}: ConversationHistoryDropdownProps) {
  const { conversations, conversationId, isLoadingConversations } = useAiDrawer();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <History className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel>Conversazioni Recenti</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoadingConversations ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center px-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nessuna conversazione</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationMenuItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === conversationId}
              onClick={() => onSelectConversation(conversation.id)}
            />
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ConversationMenuItemProps {
  conversation: AiConversation;
  isActive: boolean;
  onClick: () => void;
}

function ConversationMenuItem({ conversation, isActive, onClick }: ConversationMenuItemProps) {
  // Get display title
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
    <DropdownMenuItem
      onClick={onClick}
      className={cn("cursor-pointer flex flex-col items-start gap-1 py-3", isActive && "bg-accent")}
    >
      <div className="flex items-start gap-2 w-full">
        <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium truncate", isActive && "text-primary")}>
            {displayTitle}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            <span>•</span>
            <span>
              {messageCount} {messageCount === 1 ? "msg" : "msg"}
            </span>
          </div>
        </div>
      </div>
    </DropdownMenuItem>
  );
}
