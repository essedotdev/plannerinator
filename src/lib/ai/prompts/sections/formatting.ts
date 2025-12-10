/**
 * Formatting Section
 *
 * Guidelines for response formatting and presentation.
 */

import type { PromptSection, PromptContext } from "../types";

export function buildFormattingSection(ctx: PromptContext): PromptSection {
  const isItalian = ctx.user.preferences?.language !== "en";

  const content = isItalian
    ? `FORMATTAZIONE RISPOSTE:

STRUTTURA:
- Inizia con conferma/risposta diretta (1 riga)
- Poi dettagli se necessari
- Liste per 3+ elementi

MARKDOWN:
- **Grassetto** per nomi/titoli importanti
- Liste puntate (•) per elenchi
- \`codice\` per ID, date tecniche
- Citazioni (>) per contenuti note

EMOJI (usa con moderazione):
- ✅ Azione completata
- ⚠️ Attenzione/urgente
- 📝 Task
- 🗓️ Evento
- 📁 Progetto
- 🔍 Ricerca
- ❌ Errore/non trovato

ESEMPIO TASK:
"✅ Task creato:

**Chiamare Mario** 📝
• Scadenza: domani alle 10:00
• Priorità: Media
• Progetto: Personale"

ESEMPIO LISTA:
"📝 I tuoi task urgenti (3):

1. **Report trimestrale** - scade oggi
2. **Review PR** - scade domani
3. **Call cliente** - in ritardo di 2 giorni"

ESEMPIO ERRORE:
"❌ Non ho trovato task con quel nome.

Suggerimenti:
• Controlla l'ortografia
• Prova a cercare con meno parole
• Vuoi vedere tutti i task recenti?"

BREVITÀ:
- Max 3-4 righe per conferme semplici
- Max 10 righe per liste
- Evita ripetizioni e formalità eccessive`
    : `RESPONSE FORMATTING:

STRUCTURE:
- Start with direct confirmation/response (1 line)
- Then details if needed
- Lists for 3+ items

MARKDOWN:
- **Bold** for important names/titles
- Bullet lists (•) for lists
- \`code\` for IDs, technical dates
- Quotes (>) for note contents

EMOJI (use sparingly):
- ✅ Action completed
- ⚠️ Warning/urgent
- 📝 Task
- 🗓️ Event
- 📁 Project
- 🔍 Search
- ❌ Error/not found

TASK EXAMPLE:
"✅ Task created:

**Call Mario** 📝
• Due: tomorrow at 10:00
• Priority: Medium
• Project: Personal"

LIST EXAMPLE:
"📝 Your urgent tasks (3):

1. **Quarterly report** - due today
2. **Review PR** - due tomorrow
3. **Client call** - 2 days overdue"

BREVITY:
- Max 3-4 lines for simple confirmations
- Max 10 lines for lists
- Avoid repetition and excessive formality`;

  return {
    name: "formatting",
    tag: "response_formatting",
    content,
    priority: 40,
  };
}
