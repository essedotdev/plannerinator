/**
 * AI Chat Server Actions
 *
 * Handles communication with Claude via OpenRouter and manages conversations.
 * Uses OpenRouter's OpenAI-compatible API format.
 */

"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { aiConversation, aiUsage } from "@/db/schema";
import { aiTools } from "@/lib/ai/functions";
import { executeToolCall } from "./tool-handlers";
import { eq, desc } from "drizzle-orm";

/**
 * OpenRouter configuration
 */
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-haiku";

/**
 * Rate limit configuration for AI requests
 * TODO: Implement rate limiting using Better Auth's built-in rate limiting
 */
// const AI_RATE_LIMIT = {
//   requests: 50, // Max 50 messages per hour
//   window: 3600, // 1 hour in seconds
// };

/**
 * Cost calculation (in cents)
 * Note: Costs vary by model - these are estimates for Claude Haiku
 * Input: $1 per 1M tokens = $0.001 per 1K = 0.1 cents per 1K
 * Output: $5 per 1M tokens = $0.005 per 1K = 0.5 cents per 1K
 */
function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCostCents = (inputTokens / 1000) * 0.1;
  const outputCostCents = (outputTokens / 1000) * 0.5;
  return Math.round(inputCostCents + outputCostCents);
}

/**
 * Build system prompt with current context
 */
function buildSystemPrompt(userName: string): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("it-IT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `Sei un assistente AI per Plannerinator, un'app di produttività personale.

Data e ora corrente: ${dateStr} alle ${timeStr}
Fuso orario: Europe/Rome (UTC+1/+2)
Utente: ${userName}

Puoi aiutare l'utente a:
- Creare, modificare ed eliminare task, eventi, note e progetti
- Cercare tra le entità esistenti con filtri avanzati
- Ottenere statistiche e insights sulla produttività
- Rispondere a domande sui suoi dati

Linee guida importanti:
- Sii conciso e amichevole nel tono
- Rispondi in italiano a meno che l'utente non scriva in inglese
- Quando crei task/eventi, converti date relative ("domani", "prossima settimana") in date ISO specifiche
- Prima di eliminare qualcosa, chiedi sempre conferma a meno che l'utente non dica esplicitamente "elimina" o "cancella"
- Se trovi più risultati per un'operazione, chiedi all'utente di essere più specifico
- Mostra i risultati in modo chiaro con bullet points o liste
- Quando completi un'azione, conferma cosa hai fatto

Formattazione delle risposte:
- Usa emoji occasionalmente per rendere le risposte più amichevoli (ma senza esagerare)
- Usa **grassetto** per evidenziare informazioni importanti
- Usa liste puntate per elenchi
- Usa codice inline \`come questo\` per nomi di entità

Esempio di buona risposta:
"Ho creato il task **Chiamare Mario** con scadenza domani alle 15:00. ✓

Vuoi che aggiunga altri dettagli come priorità o progetto?"`;
}

/**
 * OpenRouter API response types (OpenAI-compatible format)
 */
type OpenRouterMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | { type: string; text?: string }[];
  tool_calls?: {
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }[];
  tool_call_id?: string;
};

type OpenRouterResponse = {
  id: string;
  choices: {
    message: {
      role: "assistant";
      content: string | null;
      tool_calls?: {
        id: string;
        type: "function";
        function: {
          name: string;
          arguments: string;
        };
      }[];
    };
    finish_reason: "stop" | "tool_calls" | "length";
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

/**
 * Call OpenRouter API
 */
async function callOpenRouter(messages: OpenRouterMessage[]): Promise<OpenRouterResponse> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://plannerinator.com",
      "X-Title": "Plannerinator AI Assistant",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools: aiTools,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Send a message to the AI assistant
 */
export async function sendAiMessage(userMessage: string, conversationId?: string) {
  // Validate session
  const { headers } = await import("next/headers");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "Non autenticato" };
  }

  // TODO: Add rate limiting
  // For now, we rely on OpenRouter's rate limiting

  try {
    // Load or create conversation
    let conversation;
    let messageHistory: Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      timestamp: string;
      toolsUsed?: Array<{ name: string; result: unknown }>;
    }> = [];

    if (conversationId) {
      const [existing] = await db
        .select()
        .from(aiConversation)
        .where(eq(aiConversation.id, conversationId))
        .limit(1);

      if (existing && existing.userId === session.user.id) {
        conversation = existing;
        messageHistory = existing.messages || [];
      }
    }

    // If no conversation, create one
    if (!conversation) {
      const [newConv] = await db
        .insert(aiConversation)
        .values({
          userId: session.user.id,
          title: userMessage.substring(0, 100),
          messages: [],
        })
        .returning();
      conversation = newConv;
    }

    // Build messages array for OpenRouter (OpenAI format)
    const messages: OpenRouterMessage[] = [
      {
        role: "system",
        content: buildSystemPrompt(session.user.name),
      },
      ...messageHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    // First API call - get tool use or direct response
    const initialResponse = await callOpenRouter(messages);
    const initialChoice = initialResponse.choices[0];

    let finalResponse = initialResponse;
    const toolsUsedForHistory: Array<{ name: string; result: unknown }> = [];

    // Handle tool calls
    if (initialChoice.finish_reason === "tool_calls" && initialChoice.message.tool_calls) {
      // Add assistant's message with tool calls to conversation
      messages.push({
        role: "assistant",
        content: initialChoice.message.content || "",
        tool_calls: initialChoice.message.tool_calls,
      });

      // Execute all tool calls
      for (const toolCall of initialChoice.message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolInput = JSON.parse(toolCall.function.arguments);

        const result = await executeToolCall(toolName, toolInput, session.user.id);

        // Add tool result to messages
        messages.push({
          role: "tool",
          content: JSON.stringify(result),
          tool_call_id: toolCall.id,
        });

        toolsUsedForHistory.push({
          name: toolName,
          result,
        });
      }

      // Second API call - get final response with tool results
      finalResponse = await callOpenRouter(messages);
    }

    // Extract text response
    const assistantMessage = finalResponse.choices[0].message.content || "Scusa, non ho capito.";

    // Calculate total tokens and cost
    const totalInputTokens =
      initialResponse.usage.prompt_tokens +
      (finalResponse !== initialResponse ? finalResponse.usage.prompt_tokens : 0);
    const totalOutputTokens =
      initialResponse.usage.completion_tokens +
      (finalResponse !== initialResponse ? finalResponse.usage.completion_tokens : 0);
    const costCents = calculateCost(totalInputTokens, totalOutputTokens);

    // Save conversation messages
    const updatedMessages = [
      ...messageHistory,
      {
        id: crypto.randomUUID(),
        role: "user" as const,
        content: userMessage,
        timestamp: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: assistantMessage,
        timestamp: new Date().toISOString(),
        toolsUsed: toolsUsedForHistory.length > 0 ? toolsUsedForHistory : undefined,
      },
    ];

    await db
      .update(aiConversation)
      .set({
        messages: updatedMessages,
        updatedAt: new Date(),
      })
      .where(eq(aiConversation.id, conversation.id));

    // Track usage
    await db.insert(aiUsage).values({
      userId: session.user.id,
      conversationId: conversation.id,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      costUsd: costCents,
      model: MODEL,
    });

    return {
      success: true,
      data: {
        conversationId: conversation.id,
        message: assistantMessage,
        tokensUsed: totalInputTokens + totalOutputTokens,
        costCents,
      },
    };
  } catch (error) {
    console.error("AI chat error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore durante l'elaborazione del messaggio",
    };
  }
}

/**
 * Get recent conversations for the current user
 */
export async function getRecentConversations(limit = 10) {
  const { headers } = await import("next/headers");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "Non autenticato" };
  }

  try {
    const conversations = await db
      .select()
      .from(aiConversation)
      .where(eq(aiConversation.userId, session.user.id))
      .orderBy(desc(aiConversation.updatedAt))
      .limit(limit);

    return {
      success: true,
      data: conversations,
    };
  } catch {
    return {
      success: false,
      error: "Errore nel caricamento delle conversazioni",
    };
  }
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(conversationId: string) {
  const { headers } = await import("next/headers");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "Non autenticato" };
  }

  try {
    const [conversation] = await db
      .select()
      .from(aiConversation)
      .where(eq(aiConversation.id, conversationId))
      .limit(1);

    if (!conversation || conversation.userId !== session.user.id) {
      return { success: false, error: "Conversazione non trovata" };
    }

    return {
      success: true,
      data: conversation,
    };
  } catch {
    return {
      success: false,
      error: "Errore nel caricamento della conversazione",
    };
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string) {
  const { headers } = await import("next/headers");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "Non autenticato" };
  }

  try {
    const [conversation] = await db
      .select()
      .from(aiConversation)
      .where(eq(aiConversation.id, conversationId))
      .limit(1);

    if (!conversation || conversation.userId !== session.user.id) {
      return { success: false, error: "Conversazione non trovata" };
    }

    await db.delete(aiConversation).where(eq(aiConversation.id, conversationId));

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Errore durante l'eliminazione",
    };
  }
}

/**
 * Get AI usage statistics for current user
 */
export async function getAiUsageStats() {
  const { headers } = await import("next/headers");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "Non autenticato" };
  }

  try {
    const usageRecords = await db
      .select()
      .from(aiUsage)
      .where(eq(aiUsage.userId, session.user.id))
      .orderBy(desc(aiUsage.createdAt));

    const totalTokens = usageRecords.reduce(
      (sum, record) => sum + record.inputTokens + record.outputTokens,
      0
    );
    const totalCostCents = usageRecords.reduce((sum, record) => sum + record.costUsd, 0);

    return {
      success: true,
      data: {
        totalMessages: usageRecords.length,
        totalTokens,
        totalCostUsd: (totalCostCents / 100).toFixed(4),
        averageTokensPerMessage: Math.round(totalTokens / (usageRecords.length || 1)),
      },
    };
  } catch {
    return {
      success: false,
      error: "Errore nel calcolo delle statistiche",
    };
  }
}
