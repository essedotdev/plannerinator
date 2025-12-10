/**
 * Dates Section
 *
 * Guide for handling relative and absolute dates.
 */

import type { PromptSection, PromptContext } from "../types";

/**
 * Get example dates based on current context
 */
function getExampleDates(ctx: PromptContext) {
  const now = ctx.temporal.now;
  const tz = ctx.temporal.timezone;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const nextMonday = new Date(now);
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  nextMonday.setDate(now.getDate() + daysUntilMonday);

  // Format as ISO with timezone offset
  const formatISO = (date: Date, time?: string) => {
    const d = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(":").map(Number);
      d.setHours(hours, minutes, 0, 0);
    }
    return d.toISOString();
  };

  return {
    today: formatISO(now),
    todayAt15: formatISO(now, "15:00"),
    tomorrow: formatISO(tomorrow),
    tomorrowAt9: formatISO(tomorrow, "09:00"),
    nextWeek: formatISO(nextWeek),
    nextMonday: formatISO(nextMonday),
    timezone: tz,
  };
}

export function buildDatesSection(ctx: PromptContext): PromptSection {
  const isItalian = ctx.user.preferences?.language !== "en";
  const dates = getExampleDates(ctx);

  const content = isItalian
    ? `GESTIONE DATE E ORARI:

Fuso orario utente: ${dates.timezone}
Converti SEMPRE le date relative in ISO 8601 con timezone.

CONVERSIONI COMUNI (esempi calcolati per oggi):
- "oggi" → ${dates.today}
- "oggi alle 15" → ${dates.todayAt15}
- "domani" → ${dates.tomorrow}
- "domani alle 9" → ${dates.tomorrowAt9}
- "tra una settimana" → ${dates.nextWeek}
- "lunedì prossimo" → ${dates.nextMonday}

REGOLE:
1. Se non specificato l'orario per un task → usa fine giornata (23:59)
2. Se non specificato l'orario per un evento → chiedi conferma
3. "Mattina" = 09:00, "Pomeriggio" = 14:00, "Sera" = 19:00
4. "Fine settimana" = prossimo sabato
5. "Prossima settimana" = lunedì prossimo

DURATA EVENTI:
- Se non specificata, default = 1 ora
- "Riunione veloce" = 30 minuti
- "Pranzo" = 1 ora
- "Workshop/Training" = 2-4 ore

ERRORI COMUNI DA EVITARE:
❌ Non usare date nel passato per task/eventi nuovi
❌ Non assumere orari senza contesto
❌ Non ignorare il fuso orario`
    : `DATE AND TIME HANDLING:

User timezone: ${dates.timezone}
ALWAYS convert relative dates to ISO 8601 with timezone.

COMMON CONVERSIONS (examples calculated for today):
- "today" → ${dates.today}
- "today at 3pm" → ${dates.todayAt15}
- "tomorrow" → ${dates.tomorrow}
- "tomorrow at 9am" → ${dates.tomorrowAt9}
- "in a week" → ${dates.nextWeek}
- "next Monday" → ${dates.nextMonday}

RULES:
1. If no time specified for a task → use end of day (23:59)
2. If no time specified for an event → ask for confirmation
3. "Morning" = 09:00, "Afternoon" = 14:00, "Evening" = 19:00
4. "Weekend" = next Saturday
5. "Next week" = next Monday

EVENT DURATION:
- If not specified, default = 1 hour
- "Quick meeting" = 30 minutes
- "Lunch" = 1 hour
- "Workshop/Training" = 2-4 hours

COMMON MISTAKES TO AVOID:
❌ Don't use past dates for new tasks/events
❌ Don't assume times without context
❌ Don't ignore the timezone`;

  return {
    name: "dates",
    tag: "date_handling",
    content,
    priority: 25,
  };
}
