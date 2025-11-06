/**
 * Chat Message Component
 *
 * Displays a single message in the AI chat interface.
 * Supports both user and assistant messages with different styling.
 */

"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  toolsUsed?: Array<{ type: string; tool_use_id: string; content: string }>;
};

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <div className={cn("prose-sm max-w-none", isUser ? "text-primary-foreground" : "text-foreground")}>
          {isUser ? (
            <p className="m-0 whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="m-0 mb-2 last:mb-0 leading-relaxed text-foreground">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="m-0 mb-2 last:mb-0 ml-4 space-y-1 text-foreground">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="m-0 mb-2 last:mb-0 ml-4 space-y-1 text-foreground">{children}</ol>
                ),
                li: ({ children }) => <li className="text-foreground leading-relaxed">{children}</li>,
                code: ({
                  inline,
                  children,
                  ...props
                }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) =>
                  inline ? (
                    <code
                      className="px-1.5 py-0.5 rounded bg-primary/10 text-foreground text-xs font-mono border border-border/50"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code
                      className="block p-3 my-2 rounded bg-primary/10 text-foreground text-xs font-mono overflow-x-auto border border-border/50"
                      {...props}
                    >
                      {children}
                    </code>
                  ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                a: ({ children, href }) => (
                  <a href={href} className="text-primary hover:underline font-medium">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {message.toolsUsed && message.toolsUsed.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-xs opacity-70">Azioni eseguite: {message.toolsUsed.length}</p>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  );
}
