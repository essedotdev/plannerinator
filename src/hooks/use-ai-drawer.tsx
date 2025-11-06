"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface AiDrawerContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
}

const AiDrawerContext = createContext<AiDrawerContextType | undefined>(undefined);

export function AiDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

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
