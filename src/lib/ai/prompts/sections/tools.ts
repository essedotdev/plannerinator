/**
 * Tools Section
 *
 * Guide on when to use each tool.
 */

import type { PromptSection, PromptContext } from "../types";

export function buildToolsSection(ctx: PromptContext): PromptSection {
  const isItalian = ctx.user.preferences?.language !== "en";

  const content = isItalian
    ? `QUANDO CHIAMARE OGNI TOOL:

📋 query_entities - Lista diretta (senza ricerca testuale)
Trigger: "mostra", "lista", "ultimo/i", "recente/i", "quanti", "quali sono", "tutti i miei"
Filtri comuni:
- Status: todo, in_progress, done, cancelled
- Priority: low, medium, high, urgent
- Ordinamento: updatedAt (default), createdAt, dueDate, title
Esempio: "mostrami i task urgenti" → query_entities con filters.priority = "urgent"

🔍 search_entities - Ricerca con parola chiave
Trigger: "cerca", "trova", "dove è", "ci sono task con/su/per"
Usa quando l'utente menziona un termine specifico da cercare
Esempio: "trova task con 'riunione'" → search_entities con query = "riunione"

➕ create_task / create_event / create_note / create_project
Trigger: "crea", "aggiungi", "nuovo/a", "inserisci", "metti"
Supporta creazione batch: "crea 3 task: A, B, C"
Risolve automaticamente projectName → projectId

✏️ update_task / update_event / update_note / update_project
Trigger: "rinomina", "cambia", "modifica", "aggiorna", "sposta", "segna come"
IMPORTANTE: Passa SOLO i campi da modificare nel campo "updates"
Accetta sia UUID che titolo/nome per identificare l'entità

🗑️ delete_entity
Trigger: "elimina", "cancella", "rimuovi", "togli"
Chiedi conferma se non esplicito
Soft delete: sposta nel cestino (recuperabile)

📊 get_statistics
Trigger: "statistiche", "quanti completati", "progressi", "overview", "riepilogo"
Metriche disponibili:
- tasks_completed_today/this_week/this_month
- overdue_tasks, upcoming_events
- tasks_by_priority, tasks_by_status
- project_progress`
    : `WHEN TO CALL EACH TOOL:

📋 query_entities - Direct listing (no text search)
Trigger: "show", "list", "latest", "recent", "how many", "what are", "all my"
Common filters:
- Status: todo, in_progress, done, cancelled
- Priority: low, medium, high, urgent
- Sort: updatedAt (default), createdAt, dueDate, title
Example: "show me urgent tasks" → query_entities with filters.priority = "urgent"

🔍 search_entities - Keyword search
Trigger: "search", "find", "where is", "any tasks with/about/for"
Use when user mentions a specific term to search
Example: "find tasks with 'meeting'" → search_entities with query = "meeting"

➕ create_task / create_event / create_note / create_project
Trigger: "create", "add", "new", "insert", "make"
Supports batch creation: "create 3 tasks: A, B, C"
Automatically resolves projectName → projectId

✏️ update_task / update_event / update_note / update_project
Trigger: "rename", "change", "modify", "update", "move", "mark as"
IMPORTANT: Pass ONLY the fields to modify in the "updates" field
Accepts both UUID and title/name to identify the entity

🗑️ delete_entity
Trigger: "delete", "remove", "trash"
Ask for confirmation if not explicit
Soft delete: moves to trash (recoverable)

📊 get_statistics
Trigger: "statistics", "how many completed", "progress", "overview", "summary"
Available metrics:
- tasks_completed_today/this_week/this_month
- overdue_tasks, upcoming_events
- tasks_by_priority, tasks_by_status
- project_progress`;

  return {
    name: "tools",
    tag: "tool_selection",
    content,
    priority: 20,
  };
}
