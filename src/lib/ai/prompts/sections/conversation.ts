/**
 * Conversation Section
 *
 * Guidelines for maintaining conversation context and handling references.
 */

import type { PromptSection, PromptContext } from "../types";

export function buildConversationSection(ctx: PromptContext): PromptSection {
  const isItalian = ctx.user.preferences?.language !== "en";
  const { conversation } = ctx;

  let contextInfo = "";
  if (conversation) {
    if (isItalian) {
      const mentions: string[] = [];
      if (conversation.lastMentionedTask) {
        mentions.push(`Task: "${conversation.lastMentionedTask.title}"`);
      }
      if (conversation.lastMentionedEvent) {
        mentions.push(`Evento: "${conversation.lastMentionedEvent.title}"`);
      }
      if (conversation.lastMentionedProject) {
        mentions.push(`Progetto: "${conversation.lastMentionedProject.name}"`);
      }
      if (mentions.length > 0) {
        contextInfo = `\n\nULTIME ENTITÀ MENZIONATE:\n${mentions.join("\n")}`;
      }
    } else {
      const mentions: string[] = [];
      if (conversation.lastMentionedTask) {
        mentions.push(`Task: "${conversation.lastMentionedTask.title}"`);
      }
      if (conversation.lastMentionedEvent) {
        mentions.push(`Event: "${conversation.lastMentionedEvent.title}"`);
      }
      if (conversation.lastMentionedProject) {
        mentions.push(`Project: "${conversation.lastMentionedProject.name}"`);
      }
      if (mentions.length > 0) {
        contextInfo = `\n\nLAST MENTIONED ENTITIES:\n${mentions.join("\n")}`;
      }
    }
  }

  const content = isItalian
    ? `GESTIONE CONTESTO CONVERSAZIONALE:

RIFERIMENTI PRONOMINALI:
- "quello", "questa", "lo/la" → ultima entità dello stesso tipo menzionata
- "il task", "l'evento" (senza nome) → ultima entità di quel tipo
- "gli altri", "i restanti" → altri risultati dall'ultima query

DISAMBIGUAZIONE:
- Se il riferimento è ambiguo, chiedi: "Ti riferisci a [X] o [Y]?"
- Se non c'è contesto, chiedi: "Quale [tipo] intendi?"

MEMORIA CONVERSAZIONE:
- Ricorda le entità mostrate/create/modificate nella conversazione
- Usa gli ID interni per operazioni successive
- Non perdere il contesto tra messaggi${contextInfo}

CONTINUITÀ:
- Se l'utente continua un discorso, non chiedere di ripetere
- "e anche..." → aggiungi alla richiesta precedente
- "invece..." → modifica la richiesta precedente
- "annulla" → se possibile, suggerisci come ripristinare`
    : `CONVERSATION CONTEXT MANAGEMENT:

PRONOMINAL REFERENCES:
- "that", "this", "it" → last mentioned entity of the same type
- "the task", "the event" (without name) → last entity of that type
- "the others", "the rest" → other results from last query

DISAMBIGUATION:
- If reference is ambiguous, ask: "Do you mean [X] or [Y]?"
- If no context, ask: "Which [type] do you mean?"

CONVERSATION MEMORY:
- Remember entities shown/created/modified in conversation
- Use internal IDs for subsequent operations
- Don't lose context between messages${contextInfo}

CONTINUITY:
- If user continues a topic, don't ask to repeat
- "and also..." → add to previous request
- "instead..." → modify previous request
- "undo" → if possible, suggest how to restore`;

  return {
    name: "conversation",
    tag: "conversation_context",
    content,
    priority: 35,
  };
}
