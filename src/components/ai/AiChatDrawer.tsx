/**
 * AI Chat Drawer Component
 *
 * Main drawer UI for the AI assistant chat interface.
 * Opens from the right side of the screen.
 */

"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { sendAiMessage } from "@/features/ai/actions";
import { useAiDrawer } from "@/hooks/use-ai-drawer";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  toolsUsed?: Array<{ type: string; tool_use_id: string; content: string }>;
};

export function AiChatDrawer() {
  const { isOpen, close, conversationId } = useAiDrawer();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversation when opening
  useEffect(() => {
    if (isOpen && conversationId) {
      // TODO: Load conversation from server
      // For now, start fresh each time
    }
  }, [isOpen, conversationId]);

  const handleSendMessage = (content: string) => {
    // Add user message optimistically
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Send to AI
    startTransition(async () => {
      try {
        const result = await sendAiMessage(content, conversationId || undefined);

        if (result.success && result.data) {
          // Add assistant response
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: result.data.message,
            timestamp: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, assistantMessage]);

          // Show cost info (optional)
          if (result.data.costCents > 0) {
            const costUsd = (result.data.costCents / 100).toFixed(4);
            console.log(`AI call cost: $${costUsd} (${result.data.tokensUsed} tokens)`);
          }
        } else {
          // Show error
          toast.error(result.error || "Errore durante l'invio del messaggio");

          // Remove user message on error
          setMessages((prev) => prev.slice(0, -1));
        }
      } catch (error) {
        console.error("Chat error:", error);
        toast.error("Errore di connessione");
        setMessages((prev) => prev.slice(0, -1));
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[440px] md:w-[500px] p-0 flex flex-col focus-visible:outline-none"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-base">AI Assistant</SheetTitle>
              <p className="text-xs text-muted-foreground">Powered by Claude Haiku 4.5</p>
            </div>
          </div>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">Ciao! 👋</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Sono il tuo assistente AI. Posso aiutarti a creare task, cercare tra le tue
                  entità, ottenere statistiche e molto altro.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                <p>Prova a chiedere:</p>
                <ul className="text-left space-y-1">
                  <li>• "Crea un task per chiamare Mario domani"</li>
                  <li>• "Mostrami i task urgenti"</li>
                  <li>• "Quanti task ho completato questa settimana?"</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {isPending && (
                <div className="flex gap-3 mb-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Sto pensando...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={handleSendMessage} disabled={isPending} />
      </SheetContent>
    </Sheet>
  );
}
