# Code Quality & Standards

Questo documento descrive gli standard di qualità del codice e le best practice utilizzate nel progetto Plannerinator.

---

## 📋 Table of Contents

- [Code Consistency](#code-consistency)
- [Type Safety](#type-safety)
- [Performance](#performance)
- [Security](#security)
- [Testing](#testing)
- [Accessibility](#accessibility)

---

## Code Consistency

### ✅ Centralized Enum Labels (`src/lib/labels.ts`)

**Problema risolto:** Evitare valori raw del database (es. `todo`, `in_progress`) mostrati direttamente all'utente.

**Soluzione:** Tutte le enum del database hanno mappature user-friendly centralizzate.

```typescript
// ❌ SBAGLIATO - mostrare valori raw
<Badge>{task.status}</Badge> // "in_progress"

// ✅ CORRETTO - usare label
import { TASK_STATUS_LABELS } from '@/lib/labels';
<Badge>{TASK_STATUS_LABELS[task.status]}</Badge> // "In Progress"
```

**Label disponibili:**

- `TASK_STATUS_LABELS`: `To Do`, `In Progress`, `Done`, `Cancelled`
- `TASK_PRIORITY_LABELS`: `Low`, `Medium`, `High`, `Urgent`
- `EVENT_CALENDAR_TYPE_LABELS`: `Personal`, `Work`, `Family`, `Other`
- `NOTE_TYPE_LABELS`: `Note`, `Document`, `Research`, `Idea`, `Snippet`
- `PROJECT_STATUS_LABELS`: `Active`, `On Hold`, `Completed`, `Archived`, `Cancelled`

**Impatto:**

- ✅ UX consistente in tutta l'app
- ✅ Facile internazionalizzazione futura (i18n)
- ✅ Singolo punto di modifica per cambio terminologia

---

### ✅ Centralized Date/Time Utilities (`src/lib/dates.ts`)

**Problema risolto:** Codice duplicato per formattazione date in 14+ file.

**Soluzione:** Utility centralizzate usando `date-fns`.

```typescript
// ❌ SBAGLIATO - logica duplicata
new Date(task.dueDate).toLocaleDateString();

// ✅ CORRETTO - usare utility
import { formatShortDate, formatFullDate, formatDateTime } from "@/lib/dates";
formatShortDate(task.dueDate); // "Jan 15"
formatFullDate(task.dueDate); // "Jan 15, 2025"
formatDateTime(task.dueDate); // "Jan 15, 02:30 PM"
```

**Utility disponibili:**

| Funzione                   | Output             | Uso                               |
| -------------------------- | ------------------ | --------------------------------- |
| `formatShortDate()`        | "Jan 15"           | Liste, card                       |
| `formatFullDate()`         | "Jan 15, 2025"     | Detail pages                      |
| `formatDateTime()`         | "Jan 15, 02:30 PM" | Eventi con orario                 |
| `formatTime()`             | "02:30 PM"         | Solo orario                       |
| `formatRelative()`         | "2 hours ago"      | Activity log                      |
| `isOverdue()`              | `boolean`          | Highlight task scaduti            |
| `getDaysUntil()`           | `number`           | Countdown                         |
| `getDaysSince()`           | `number`           | Elapsed time                      |
| `formatForDateInput()`     | "2025-01-15"       | HTML input[type="date"]           |
| `formatForDateTimeInput()` | "2025-01-15T14:30" | HTML input[type="datetime-local"] |

**Impatto:**

- ✅ Formattazione consistente in tutta l'app
- ✅ Facile cambio di libreria date (es. Day.js)
- ✅ Ridotto codice duplicato (~200 LOC eliminati)

---

### ✅ Feature Flags (`src/lib/features.ts`)

Sistema di feature flags per abilitare/disabilitare funzionalità gradualmente:

```typescript
import { FEATURES } from '@/lib/features';

// Uso nei componenti
{FEATURES.SEARCH && <CommandPalette />}
{FEATURES.AI_ASSISTANT && <ChatInterface />}

// Uso nelle route
if (!FEATURES.COLLECTIONS) {
  notFound();
}
```

**Benefici:**

- ✅ Deploy incrementale di nuove feature
- ✅ A/B testing semplificato
- ✅ Rollback rapido in caso di problemi

---

## Type Safety

### ✅ TypeScript Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ✅ Branded Types per ID

Evita confusione tra diversi tipi di ID:

```typescript
// src/lib/branded-types.ts
export type TaskId = string & { readonly __brand: "TaskId" };
export type EventId = string & { readonly __brand: "EventId" };
export type ProjectId = string & { readonly __brand: "ProjectId" };

// ❌ Previene errori tipo:
const taskId: TaskId = "task_123";
const eventId: EventId = taskId; // ❌ Type error!
```

### ✅ Zod Validation

Tutte le entità hanno Zod schemas per validazione runtime:

```typescript
// ✅ Validazione form
const result = createTaskSchema.safeParse(formData);
if (!result.success) {
  return { errors: result.error.flatten() };
}

// ✅ Type inference automatico
type CreateTaskInput = z.infer<typeof createTaskSchema>;
```

### ✅ Drizzle Type Inference

```typescript
// ✅ Types inferiti dal database schema
import { task, type Task, type NewTask } from "@/db/schema";

// Task = tipo completo con id, timestamps
// NewTask = tipo per insert (no id, no timestamps)
```

---

## Performance

### ✅ Server Components (RSC)

Default per tutte le pagine, a meno che non servano interazioni client:

```typescript
// ✅ Server Component (default)
export default async function TasksPage() {
  const tasks = await getTasks(); // Fetch server-side
  return <TaskList tasks={tasks} />;
}

// ✅ Client Component (solo quando necessario)
'use client';
export function TaskFilters() {
  const [filters, setFilters] = useState({});
  // ...
}
```

### ✅ Server Actions per Mutations

```typescript
// ✅ Server Action
"use server";
export async function createTask(data: CreateTaskInput) {
  await db.insert(task).values(data);
  revalidatePath("/dashboard/tasks");
}

// ❌ NON usare API routes per CRUD semplici
```

### ✅ Database Indexes

```typescript
// src/db/schema.ts
export const task = pgTable(
  "task",
  {
    // ...
  },
  (table) => ({
    userIdIdx: index("task_user_id_idx").on(table.userId),
    projectIdIdx: index("task_project_id_idx").on(table.projectId),
    dueDateIdx: index("task_due_date_idx").on(table.dueDate),
    statusIdx: index("task_status_idx").on(table.status),
  })
);
```

### ⏳ Future Optimizations

- React Query for client-side caching
- Redis cache per heavy queries
- Virtual scrolling per liste lunghe
- Image optimization (quando aggiungeremo R2 uploads)

---

## Security

### ✅ Better Auth con RBAC

```typescript
// ✅ Auth check in layout (una volta per tutto /dashboard)
export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session?.user) redirect('/login');
  return <>{children}</>;
}

// ✅ Role-based access
import { RoleGate } from '@/components/auth/RoleGate';
<RoleGate allowedRoles={['admin']}>
  <AdminPanel />
</RoleGate>
```

### ✅ SQL Injection Prevention

```typescript
// ✅ Drizzle usa parametrized queries automaticamente
await db.select().from(task).where(eq(task.userId, userId));

// ❌ MAI concatenare SQL manualmente
await db.execute(`SELECT * FROM task WHERE user_id = '${userId}'`);
```

### ✅ XSS Prevention

```typescript
// ✅ React auto-escape di default
<p>{task.description}</p>

// ⚠️ Solo quando NECESSARIO (es. markdown sanitized)
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

### ✅ CSRF Protection

- Better Auth gestisce CSRF tokens automaticamente
- Cookies HttpOnly per session tokens

### ✅ Rate Limiting

```typescript
// src/lib/rate-limit.ts
// Database-backed rate limiting (edge-compatible)
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const identifier = req.headers.get("x-forwarded-for") || "anonymous";

  const { success } = await rateLimit({
    identifier,
    limit: 10,
    window: "1m",
  });

  if (!success) {
    return new Response("Too many requests", { status: 429 });
  }
  // ...
}
```

### ⏳ Future Security

- Content Security Policy headers
- Audit log per security events

---

## Testing

### ✅ Testing Infrastructure

- **Vitest** configurato con path aliases
- **Factory functions** per dati di test (`src/db/seed/factories.ts`)
- **Database seeding** per dev environment

### ✅ Validation Tests

```typescript
// ✅ Tutti gli schemas hanno tests
describe("createTaskSchema", () => {
  it("validates required fields", () => {
    const result = createTaskSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
```

**Coverage attuale:**

- ✅ Task validation: 34 tests
- ✅ Event validation: 35 tests
- ✅ Note validation: 39 tests
- ✅ Project validation: 35 tests

### ❌ Tests Skipped (decisione progetto)

- Server Actions tests (focus su feature invece di test coverage)
- Database Queries tests
- E2E tests (Playwright)

**Rationale:** Priorità su velocità di sviluppo e feature delivery.

---

## Accessibility

### ✅ Keyboard Navigation

```typescript
// ✅ Tab navigation supportata
<button>Create Task</button> // Focusable

// ✅ Arrow keys in Command Palette
<CommandPalette /> // ↑↓ per navigare, Enter per selezionare

// ✅ Escape per chiudere dialog
<Dialog onOpenChange={setOpen} />
```

### ✅ ARIA Labels

```typescript
// ✅ ARIA per screen readers
<button aria-label="Delete task">
  <Trash2 />
</button>

// ✅ Form labels
<Label htmlFor="title">Task Title</Label>
<Input id="title" />
```

### ✅ Color Contrast (WCAG AA)

- Tutti i colori testati per contrasto minimo 4.5:1
- Dark mode supportato con colori accessibili

### ✅ Focus Management

```typescript
// ✅ Focus trap nei dialog
<Dialog>
  <DialogContent> {/* Focus trap automatico */}
    <Input autoFocus />
  </DialogContent>
</Dialog>
```

### ⏳ Future Improvements

- Screen reader testing completo
- Reduced motion preference support
- ARIA live regions per notifiche

---

## Mobile

### ✅ Responsive Design

- Mobile-first approach con Tailwind CSS
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Touch-friendly targets (min 44px)

```typescript
// ✅ Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### ✅ Mobile Navigation

- Sidebar collapsible su mobile
- Bottom sheet per azioni rapide
- Swipe gestures (planned)

### ⏳ PWA Features (Future)

- Service worker per offline mode
- Install prompt
- Push notifications

---

## 📝 Contributing

Quando aggiungi nuove feature, assicurati di:

1. ✅ Usare `@/lib/labels.ts` per enum labels
2. ✅ Usare `@/lib/dates.ts` per date formatting
3. ✅ Aggiungere Zod validation schemas
4. ✅ Seguire la convenzione Server Component + Client Component
5. ✅ Aggiungere database indexes per nuove query
6. ✅ Testare keyboard navigation
7. ✅ Verificare color contrast in dark mode
8. ✅ Aggiornare `FEATURES` flag se necessario

---

**Ultimo aggiornamento:** 2025-01-22
