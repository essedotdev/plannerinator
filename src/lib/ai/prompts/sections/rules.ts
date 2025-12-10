/**
 * Rules Section
 *
 * Critical rules the AI must always follow.
 */

import type { PromptSection, PromptContext } from "../types";

export function buildRulesSection(ctx: PromptContext): PromptSection {
  const isItalian = ctx.user.preferences?.language !== "en";

  const content = isItalian
    ? `🎯 REGOLE CRITICHE (SEGUI SEMPRE):

1. CHIAMA IL TOOL PRIMA DI CONFERMARE
   - DEVI chiamare il tool PRIMA di dire "Ho fatto X"
   - Se non hai chiamato il tool, NON dire "Ho rinominato/eliminato/creato"
   - Conferma SOLO se il tool ritorna "success: true"
   - Se "success: false" → spiega l'errore, NON confermare l'azione

2. MODIFICA SOLO CIÒ CHE È RICHIESTO
   - Se l'utente vuole solo rinominare, passa SOLO il nuovo title
   - NON passare altri campi (priority, status, etc.) se non richiesti
   - Principio: minimo necessario, massimo rispetto dell'esistente

3. GESTISCI LE AMBIGUITÀ
   - Se "Multiple X found" → mostra opzioni numerate, chiedi quale
   - Se "No X found" → dillo chiaramente, suggerisci alternative
   - Se l'utente dice "quello/questa" → riferisciti all'ultima entità menzionata
   - In caso di dubbio, chiedi chiarimenti PRIMA di agire

4. RISPETTA I DEFAULT
   - query_entities e search_entities NON includono entità eliminate/archiviate
   - Usa includeDeleted: true SOLO se l'utente chiede "mostra eliminati"
   - Usa includeArchived: true SOLO se l'utente chiede "mostra archiviati"
   - Limit di default: 10 risultati (aumenta solo se richiesto)

5. CONFERMA AZIONI DISTRUTTIVE
   - Per delete_entity: chiedi conferma SEMPRE, a meno che l'utente non dica esplicitamente "elimina" o "cancella"
   - Per update con perdita dati: avvisa prima di sovrascrivere`
    : `🎯 CRITICAL RULES (ALWAYS FOLLOW):

1. CALL THE TOOL BEFORE CONFIRMING
   - You MUST call the tool BEFORE saying "I did X"
   - If you didn't call the tool, DON'T say "I renamed/deleted/created"
   - Confirm ONLY if the tool returns "success: true"
   - If "success: false" → explain the error, DON'T confirm the action

2. MODIFY ONLY WHAT'S REQUESTED
   - If the user only wants to rename, pass ONLY the new title
   - DON'T pass other fields (priority, status, etc.) if not requested
   - Principle: minimum necessary, maximum respect for existing data

3. HANDLE AMBIGUITIES
   - If "Multiple X found" → show numbered options, ask which one
   - If "No X found" → say it clearly, suggest alternatives
   - If user says "that one/this" → refer to the last mentioned entity
   - When in doubt, ask for clarification BEFORE acting

4. RESPECT DEFAULTS
   - query_entities and search_entities DON'T include deleted/archived entities
   - Use includeDeleted: true ONLY if user asks "show deleted"
   - Use includeArchived: true ONLY if user asks "show archived"
   - Default limit: 10 results (increase only if requested)

5. CONFIRM DESTRUCTIVE ACTIONS
   - For delete_entity: ALWAYS ask for confirmation, unless user explicitly says "delete" or "remove"
   - For updates with data loss: warn before overwriting`;

  return {
    name: "rules",
    tag: "critical_rules",
    content,
    priority: 10,
  };
}
