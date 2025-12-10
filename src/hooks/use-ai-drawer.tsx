"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getRecentConversations } from "@/features/ai/actions";
import type { AiConversation } from "@/db/schema";

interface AiDrawerContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  conversations: AiConversation[];
  isLoadingConversations: boolean;
  loadConversations: () => Promise<void>;
  createNewConversation: () => void;
  selectConversation: (id: string) => void;
}

const AiDrawerContext = createContext<AiDrawerContextType | undefined>(undefined);

export function AiDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Load conversations list from server
  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const result = await getRecentConversations(20);
      if (result.success && result.data) {
        setConversations(result.data);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Create new conversation (reset state)
  const createNewConversation = useCallback(() => {
    setConversationId(null);
  }, []);

  // Select existing conversation
  const selectConversation = useCallback((id: string) => {
    setConversationId(id);
  }, []);

  // Load conversations when drawer opens
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, loadConversations]);

  // Keyboard shortcut: Cmd/Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <AiDrawerContext.Provider
      value={{
        isOpen,
        open,
        close,
        toggle,
        conversationId,
        setConversationId,
        conversations,
        isLoadingConversations,
        loadConversations,
        createNewConversation,
        selectConversation,
      }}
    >
      {children}
    </AiDrawerContext.Provider>
  );
}

export function useAiDrawer() {
  const context = useContext(AiDrawerContext);
  if (!context) {
    throw new Error("useAiDrawer must be used within AiDrawerProvider");
  }
  return context;
}
