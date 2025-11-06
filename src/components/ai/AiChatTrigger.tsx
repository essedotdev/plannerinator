/**
 * AI Chat Trigger Button
 *
 * Button to open the AI chat drawer.
 * Can be placed anywhere in the app (header, sidebar, etc.)
 */

"use client";

import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useAiDrawer } from "@/hooks/use-ai-drawer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AiChatTriggerProps {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AiChatTrigger({
  variant = "outline",
  size = "icon",
  className,
}: AiChatTriggerProps) {
  const { open } = useAiDrawer();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={open}
            className={className}
            aria-label="Open AI Assistant"
          >
            <Bot className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>AI Assistant</p>
          <p className="text-xs text-muted-foreground">Cmd+Shift+A</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
