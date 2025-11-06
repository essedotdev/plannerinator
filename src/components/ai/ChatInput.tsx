/**
 * Chat Input Component
 *
 * Text input with send button for the AI chat.
 * Handles textarea auto-resize and keyboard shortcuts.
 */

"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Scrivi un messaggio... (Shift+Enter per nuova riga)",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn("min-h-[44px] max-h-[200px] resize-none", "focus-visible:ring-1")}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          size="icon"
          className="flex-shrink-0 h-[44px] w-[44px]"
        >
          {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">Enter</kbd> per inviare,{" "}
        <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">Shift+Enter</kbd> per
        nuova riga
      </p>
    </div>
  );
}
