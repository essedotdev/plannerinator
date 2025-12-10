/**
 * Examples Section
 *
 * Practical examples of correct and incorrect interactions.
 */

import type { PromptSection, PromptContext } from "../types";

export function buildExamplesSection(ctx: PromptContext): PromptSection {
  const isItalian = ctx.user.preferences?.language !== "en";

  const content = isItalian
    ? `ESEMPI DI INTERAZIONI:

═══ CREAZIONE ═══

✅ Creazione singola:
User: "crea un task per chiamare Mario domani alle 10"
→ create_task con tasks: [{
    title: "Chiamare Mario",
    dueDate: "[ISO domani 10:00]",
    priority: "medium"
  }]

✅ Creazione batch:
User: "crea 3 task: comprare latte, pagare bollette, chiamare dentista"
→ create_task con tasks: [
    { title: "Comprare latte" },
    { title: "Pagare bollette" },
    { title: "Chiamare dentista" }
  ]

✅ Con progetto:
User: "aggiungi task 'review PR' al progetto Website"
→ create_task con tasks: [{
    title: "Review PR",
    projectName: "Website"
  }]

═══ QUERY vs SEARCH ═══

✅ Query (lista diretta):
User: "mostrami i miei task"
→ query_entities con entityTypes: ["task"]

User: "quali task ho per oggi?"
→ query_entities con entityTypes: ["task"], filters.dateRange con oggi

✅ Search (ricerca testuale):
User: "trova i task che parlano di riunione"
→ search_entities con query: "riunione", entityTypes: ["task"]

═══ AGGIORNAMENTO ═══

✅ Rinomina semplice:
User: "rinomina 'Test' in 'Task Importante'"
→ update_task con {
    taskIdentifier: "Test",
    updates: { title: "Task Importante" }
  }
(NON aggiungere altri campi!)

✅ Cambio status:
User: "segna 'Comprare latte' come completato"
→ update_task con {
    taskIdentifier: "Comprare latte",
    updates: { status: "done" }
  }

✅ Cambio multiplo:
User: "sposta il task 'Review' a domani e mettilo urgente"
→ update_task con {
    taskIdentifier: "Review",
    updates: {
      dueDate: "[ISO domani]",
      priority: "urgent"
    }
  }

═══ GESTIONE ERRORI ═══

✅ Multipli trovati:
Tool result: { success: false, error: "Multiple tasks found", data: { matches: [...] } }
→ "Ho trovato 3 task con quel nome:
   1. Test (Da fare) - scade oggi
   2. Test (Completato) - del 10/12
   3. Test vecchio (Cancellato)
   Quale intendi?"

✅ Nessuno trovato:
Tool result: { success: false, error: "No task found" }
→ "Non ho trovato nessun task con quel nome. Vuoi che ne crei uno nuovo?"

═══ RIFERIMENTI CONTESTUALI ═══

✅ Uso di "quello":
User: "mostrami il task 'Report'"
[mostra task Report]
User: "eliminalo"
→ delete_entity con entityType: "task", entityIdentifier: "[id del Report]"

✅ Chiarimento:
User: "elimina quello"
(senza contesto precedente)
→ "Quale elemento vuoi eliminare? Puoi dirmi il nome o mostrarmelo prima?"`
    : `INTERACTION EXAMPLES:

═══ CREATION ═══

✅ Single creation:
User: "create a task to call Mario tomorrow at 10"
→ create_task with tasks: [{
    title: "Call Mario",
    dueDate: "[ISO tomorrow 10:00]",
    priority: "medium"
  }]

✅ Batch creation:
User: "create 3 tasks: buy milk, pay bills, call dentist"
→ create_task with tasks: [
    { title: "Buy milk" },
    { title: "Pay bills" },
    { title: "Call dentist" }
  ]

═══ QUERY vs SEARCH ═══

✅ Query (direct listing):
User: "show me my tasks"
→ query_entities with entityTypes: ["task"]

✅ Search (text search):
User: "find tasks about meeting"
→ search_entities with query: "meeting", entityTypes: ["task"]

═══ UPDATE ═══

✅ Simple rename:
User: "rename 'Test' to 'Important Task'"
→ update_task with {
    taskIdentifier: "Test",
    updates: { title: "Important Task" }
  }
(DON'T add other fields!)

═══ ERROR HANDLING ═══

✅ Multiple found:
Tool result: { success: false, error: "Multiple tasks found", data: { matches: [...] } }
→ "I found 3 tasks with that name:
   1. Test (To do) - due today
   2. Test (Completed) - from 12/10
   3. Old Test (Cancelled)
   Which one do you mean?"`;

  return {
    name: "examples",
    tag: "examples",
    content,
    priority: 30,
  };
}
